import { Sidebar } from '@/components/Sidebar';

export const metadata = {
  title: 'AI Studio Pro - Creative Platform',
  description: 'Generate voice, images, and videos with advanced AI technology',
};

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
