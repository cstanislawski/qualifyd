'use client';

import Terminal from '@/components/Terminal';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Markdown } from '@/components/ui/markdown';
import { GripVertical } from 'lucide-react';

export default function TerminalPage() {
  // Use the useParams hook to get route parameters client-side
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const [isResizing, setIsResizing] = useState(false);

  // This would be fetched from an API in a real implementation
  const assessmentDetails = {
    title: "Kubernetes Troubleshooting",
    timeRemaining: "01:30:00",
    instructions: `
# Kubernetes Troubleshooting

## Task: Fix the Kubernetes Deployment

A Kubernetes deployment is failing to create pods. Your task is to:

1. Examine the deployment configuration
2. Identify the issues preventing the pods from starting
3. Fix the configuration errors
4. Verify the deployment is working correctly

### Useful commands:

\`\`\`bash
kubectl get pods
kubectl get deployments
kubectl describe deployment <name>
kubectl describe pod <name>
kubectl logs <pod-name>
kubectl edit deployment <name>
\`\`\`

Use standard kubectl commands to diagnose and fix the problems.

### Success criteria:
- The deployment should be in a Ready state
- Pods should be running without errors
- The application should respond to requests
    `,
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const onResize = (e: React.MouseEvent) => {
    if (!isResizing) return;

    const container = document.getElementById('resize-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = (e.clientX - containerRect.left) / containerRect.width * 100;

    // Constrain width between 20% and 60%
    const constrainedWidth = Math.min(Math.max(newWidth, 20), 60);
    setLeftPanelWidth(constrainedWidth);
  };

  return (
    <div
      className="h-[calc(100vh-4rem)] bg-zinc-950 p-4"
      onMouseMove={onResize}
      onMouseUp={stopResizing}
      onMouseLeave={stopResizing}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-zinc-100">{assessmentDetails.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Time Remaining:</span>
          <div className="bg-zinc-800 px-3 py-1 rounded-md text-sm font-mono font-medium text-zinc-200 border border-zinc-700">
            {assessmentDetails.timeRemaining}
          </div>
        </div>
      </div>

      <div
        id="resize-container"
        className="h-[calc(100%-3rem)] bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden flex"
      >
        {/* Left Panel - Instructions */}
        <div
          className="h-full overflow-y-auto bg-zinc-900 border-r border-zinc-800 p-4"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Markdown
            content={assessmentDetails.instructions}
            className="text-zinc-200"
          />
        </div>

        {/* Resize Handle */}
        <div
          className="h-full w-[6px] cursor-col-resize flex items-center justify-center hover:bg-zinc-700"
          onMouseDown={startResizing}
        >
          <GripVertical className="h-6 w-6 text-zinc-500" />
        </div>

        {/* Right Panel - Terminal */}
        <div
          className="h-full overflow-hidden bg-zinc-900"
          style={{ width: `calc(${100 - leftPanelWidth}% - 6px)` }}
        >
          {id && <Terminal assessmentId={id} />}
        </div>
      </div>
    </div>
  );
}
