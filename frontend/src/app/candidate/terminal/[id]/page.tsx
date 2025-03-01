'use client';

import Terminal from '@/components/Terminal';
import { useParams } from 'next/navigation';

export default function TerminalPage() {
  // Use the useParams hook to get route parameters client-side
  const params = useParams<{ id: string }>();
  const id = params.id;

  // This would be fetched from an API in a real implementation
  const assessmentDetails = {
    title: "Kubernetes Troubleshooting",
    timeRemaining: "01:30:00",
    instructions: `
      <h3>Task: Fix the Kubernetes Deployment</h3>
      <p>A Kubernetes deployment is failing to create pods. Your task is to:</p>
      <ol>
        <li>Examine the deployment configuration</li>
        <li>Identify the issues preventing the pods from starting</li>
        <li>Fix the configuration errors</li>
        <li>Verify the deployment is working correctly</li>
      </ol>
      <p>Use standard kubectl commands to diagnose and fix the problems.</p>
    `,
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="mb-4 bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">{assessmentDetails.title}</h1>
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-500 mr-2">Time Remaining:</div>
            <div className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono font-medium text-gray-800">
              {assessmentDetails.timeRemaining}
            </div>
          </div>
        </div>

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: assessmentDetails.instructions }} />
      </div>

      <div className="bg-white shadow rounded-lg p-4 h-[calc(100%-5rem)]">
        <div className="h-full">
          {id && <Terminal assessmentId={id} />}
        </div>
      </div>
    </div>
  );
}
