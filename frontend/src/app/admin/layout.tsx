import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Qualifyd',
  description: 'Manage your Qualifyd platform settings and resources'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
