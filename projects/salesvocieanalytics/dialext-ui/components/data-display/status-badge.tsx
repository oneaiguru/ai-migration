import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeType = 'ЛИД' | 'СДЕЛКА' | 'ЗВОНОК';

interface StatusBadgeProps {
  type: BadgeType;
  className?: string;
}

export function StatusBadge({ type, className }: StatusBadgeProps) {
  const colors: Record<BadgeType, string> = {
    ЛИД: 'bg-badge-lead text-white',
    СДЕЛКА: 'bg-badge-deal text-white',
    ЗВОНОК: 'bg-badge-call text-white',
  };

  return (
    <Badge className={cn('font-semibold text-xs', colors[type], className)}>
      {type}
    </Badge>
  );
}
