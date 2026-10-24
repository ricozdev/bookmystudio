import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password — BookMyStudio',
  description: 'Enter your new account password to regain access to BookMyStudio.',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Your new password must be at least 8 characters in length and include numbers or symbols."
      footerPrompt={{
        text: 'Cancel and return to',
        linkText: 'Sign In',
        linkHref: '/login',
      }}
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-zinc-400">Loading recovery form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
