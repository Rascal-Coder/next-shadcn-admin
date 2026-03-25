import SignInViewPage from '@/features/auth/components/sign-in-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign in to the dashboard (demo local session).'
};

export default function Page() {
  return <SignInViewPage />;
}
