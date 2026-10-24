import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — BookMyStudio',
  description: 'Sign in to access your commercial stage bookings, call sheet rosters, and equipment holds.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to BookMyStudio"
      subtitle="Access your production bookings, call sheet rosters, and verified stage holds."
      footerPrompt={{
        text: "Don't have a production account?",
        linkText: "Create Account",
        linkHref: "/create-account",
      }}
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-zinc-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
