import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDocker = process.env.IN_DOCKER === 'true';

  let httpsOptions = false;

  if (command === 'serve' && !isDocker) {
    // Chỉ tạo/chạy cert khi đang chạy `vite dev` và không ở trong Docker
    const baseFolder = env.APPDATA !== undefined && env.APPDATA !== '' ? `${env.APPDATA}/ASP.NET/https` : `${env.HOME}/.aspnet/https`;

    const certificateName = 'aigenvideo.client';
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
      if (
        0 !==
        child_process.spawnSync('dotnet', ['dev-certs', 'https', '--export-path', certFilePath, '--format', 'Pem', '--no-password'], {
          stdio: 'inherit',
        }).status
      ) {
        throw new Error('Could not create certificate.');
      }
    }

    httpsOptions = {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    };
  }

  const target = env.VITE_SERVER_PROXY || 'https://localhost:7073';

  return {
    plugins: [
      svgr({
        exportAsReactComponent: true,
      }),
      plugin(),
      tailwindcss(),
      crossOriginIsolation(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '^/api': {
          target,
          secure: false,
        },
      },
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
      port: parseInt(env.DEV_SERVER_PORT || '50465'),
      https: httpsOptions,
    },
  };
});
