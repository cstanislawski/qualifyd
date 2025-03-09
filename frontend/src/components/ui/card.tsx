import React from 'react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { cn } from "@/utils/cn"

interface CardProps {
  variant?: 'primary' | 'secondary' | 'neutral';
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'neutral',
  children,
  className = '',
  hover = true,
  glow = true,
}) => {
  const ds = useDesignSystem();
  const styles = ds.getCardStyle(variant);
  const borderRadius = ds.getBorder('radius', 'xl');
  const transition = ds.getAnimation('duration', 300);
  const blur = ds.getEffect('blur', 'sm');

  return (
    <div className="relative group">
      {glow && (
        <div
          className={`absolute -inset-0.5 ${borderRadius} opacity-20 group-hover:opacity-30 ${blur} ${transition} ${styles.gradient}`}
        />
      )}
      <div
        className={`
          relative bg-zinc-800/80 ${borderRadius} p-5 h-full
          border ${styles.border}
          ${hover ? `group-hover:border-${ds.getColor('primary.base')}/20 group-hover:shadow-sm group-hover:shadow-${ds.getColor('primary.base')}/5` : ''}
          ${transition}
          backdrop-blur-sm
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
};

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-zinc-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
