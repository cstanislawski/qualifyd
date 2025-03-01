import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/cn';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('prose prose-zinc max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={cn('text-xl font-bold mt-6 mb-2', className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn('text-lg font-bold mt-5 mb-2', className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn('text-base font-bold mt-4 mb-2', className)} {...props} />
          ),
          p: ({ className, ...props }) => (
            <p className={cn('mb-3', className)} {...props} />
          ),
          ul: ({ className, ...props }) => (
            <ul className={cn('list-disc pl-6 mb-3', className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn('list-decimal pl-6 mb-3', className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn('mb-1', className)} {...props} />
          ),
          code: ({ className, ...props }) => (
            <code className={cn('bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm font-mono', className)} {...props} />
          ),
          pre: ({ className, ...props }) => (
            <pre className={cn('bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md overflow-auto text-sm font-mono mb-3', className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a className={cn('text-blue-600 hover:underline dark:text-blue-400', className)} {...props} />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote className={cn('border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic mb-3', className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
