import React from 'react';
import { GalleryVerticalEnd } from 'lucide-react';
import { ChangePasswordForm } from './components';
import { useSearchParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

function ChangePasswordPage() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  console.log('ChangePasswordPage rendered with email:', email, 'and token:', token);
  console.log(encodeURIComponent(token));

  if (!email || !token) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </span>
        <ChangePasswordForm email={email} token={token} />
      </div>
    </div>
  );
}

export default ChangePasswordPage;
