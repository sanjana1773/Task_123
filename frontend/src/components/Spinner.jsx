import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const Spinner = ({ size = 'md', label, className }) => {
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-muted-foreground', className)}>
      <Loader2 className={cn(dim, 'animate-spin text-primary')} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
};

export default Spinner;
