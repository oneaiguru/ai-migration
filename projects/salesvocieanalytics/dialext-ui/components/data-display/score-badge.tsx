import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  percent: number;
  children: React.ReactNode;
  className?: string;
}

export function ScoreBadge({ percent, children, className }: ScoreBadgeProps) {
  const variant =
    percent >= 72 ? 'good' : percent >= 40 ? 'acceptable' : 'poor';

  return (
    <Badge
      className={cn(
        'font-semibold',
        variant === 'good' && 'bg-score-good text-white',
        variant === 'acceptable' && 'bg-score-acceptable text-slate-900',
        variant === 'poor' && 'bg-score-poor text-white',
        className
      )}
    >
      {children}
    </Badge>
  );
}
