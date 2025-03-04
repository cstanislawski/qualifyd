import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Qualifyd',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
