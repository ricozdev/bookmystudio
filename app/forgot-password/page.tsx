import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — BookMyStudio',
  description: 'Request a secure link to reset your BookMyStudio production account password.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter the work email associated with your production profile to receive secure recovery instructions."
      footerPrompt={{
        text: 'Remember your password?',
        linkText: 'Sign In',
        linkHref: '/login',
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
