import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates - Qualifyd',
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
