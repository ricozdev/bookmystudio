import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account — BookMyStudio',
  description: 'Create a production account to discover verified cycloramas, soundstages, filming locations, and union crew.',
};

export default function CreateAccountPage() {
  return (
    <AuthLayout
      title="Create Your Production Account"
      subtitle="Join verified commercial producers, studio operators, and department heads."
      footerPrompt={{
        text: 'Already registered on BookMyStudio?',
        linkText: 'Sign In',
        linkHref: '/login',
      }}
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-zinc-400">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
