import { Circle, CircleDot, CheckCircle2, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    icon: Circle,
    className: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-300 ring-1 ring-slate-500/20',
  },
  in_progress: {
    label: 'In Progress',
    icon: CircleDot,
    className: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-1 ring-fuchsia-500/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30',
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500', icon: ArrowDownCircle },
  medium: { label: 'Medium', className: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', icon: AlertCircle },
  high: { label: 'High', className: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500 shadow-sm shadow-pink-500/50', icon: ArrowUpCircle },
};

export const StatusBadge = ({ status, className }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className, className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, className }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
