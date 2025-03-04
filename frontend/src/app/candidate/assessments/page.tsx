'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CandidateAssessmentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified assessments page
    router.push('/assessments');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-400">Redirecting to assessments page...</p>
    </div>
  );
}
