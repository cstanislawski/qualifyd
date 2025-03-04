import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessments - Qualifyd',
  description: 'Manage your company\'s technical assessments and candidate results'
};

export default function AssessmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
