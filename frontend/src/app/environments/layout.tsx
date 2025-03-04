import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Environments - Qualifyd',
};

export default function EnvironmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
