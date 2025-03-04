import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team - Qualifyd',
  description: 'Manage your team members and their roles within Qualifyd'
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
