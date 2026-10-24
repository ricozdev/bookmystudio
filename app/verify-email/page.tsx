import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { EmailOtpForm } from '@/components/auth/EmailOtpForm';

export const metadata: Metadata = {
  title: 'Verify Your Email — BookMyStudio',
  description: 'Enter your 6-digit confirmation code to verify your production account email.',
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify Your Work Email"
      subtitle="Enter the 6-digit confirmation code sent to your inbox to activate your production profile."
      footerPrompt={{
        text: 'Already verified or need help?',
        linkText: 'Sign In',
        linkHref: '/login',
      }}
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-zinc-400">Loading verification...</div>}>
        <EmailOtpForm />
      </Suspense>
    </AuthLayout>
  );
}
