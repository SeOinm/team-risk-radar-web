import { cn } from '@/lib/utils';

export function LoadingSkeleton({ label, rows = 3, className }: {
  label: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      <span role="status" className="sr-only">{label} 로딩 중</span>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index}
            className={cn('h-4 rounded-md bg-muted', ['w-3/4', 'w-1/2', 'w-2/3'][index % 3])} />
        ))}
      </div>
    </div>
  );
}
