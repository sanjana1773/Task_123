import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MoreHorizontal, Pencil, Plus, Trash2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, colorForKey, initials } from './ui/Avatar';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { cn } from '../lib/utils';

const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    accent: 'bg-slate-400',
    bar: 'bg-gradient-to-r from-slate-400 to-slate-300',
    headerBg: 'bg-gradient-to-br from-slate-500/5 to-slate-500/0 dark:from-slate-400/10 dark:to-slate-400/0',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    accent: 'bg-fuchsia-500',
    bar: 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400',
    headerBg: 'bg-gradient-to-br from-fuchsia-500/10 to-pink-500/0',
  },
  {
    id: 'completed',
    label: 'Completed',
    accent: 'bg-emerald-500',
    bar: 'bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500',
    headerBg: 'bg-gradient-to-br from-emerald-500/10 to-lime-500/0',
  },
];

const PRIORITY_STRIPE = {
  low: 'bg-gradient-to-b from-cyan-400 to-cyan-600',
  medium: 'bg-gradient-to-b from-amber-400 to-amber-600',
  high: 'bg-gradient-to-b from-pink-500 to-rose-600',
};

const isOverdue = (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();

const TaskCard = ({ task, isAdmin, canEditStatus, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) => (
  <motion.div
    layout
    layoutId={task._id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    draggable={canEditStatus}
    onDragStart={(e) => onDragStart?.(e, task)}
    onDragEnd={onDragEnd}
    className={cn(
      'group relative cursor-grab overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:cursor-grabbing',
      !canEditStatus && 'cursor-default hover:translate-y-0'
    )}
  >
    <span className={cn('absolute inset-y-0 left-0 w-1', PRIORITY_STRIPE[task.priority] || PRIORITY_STRIPE.medium)} />
    <div className="p-3 pl-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-snug text-foreground">{task.title}</div>
          {task.description && (
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</div>
          )}
        </div>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 -mt-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(task)}><Pencil /> Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onDelete(task._id)} className="text-destructive focus:text-destructive">
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <Avatar className="h-6 w-6 ring-2 ring-card">
              <AvatarFallback className={cn('text-[10px]', colorForKey(task.assignedTo._id))}>
                {initials(task.assignedTo.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
              <UserIcon className="h-3 w-3" />
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            {task.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
        {task.dueDate && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px]',
            isOverdue(task)
              ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/30'
              : 'bg-muted text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const QuickAdd = ({ onAdd, status }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim(), status);
    setValue('');
    setOpen(false);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" /> Add task
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="Task title..."
        className="h-8 text-xs"
        maxLength={150}
      />
      <div className="flex gap-1">
        <Button type="submit" size="sm" className="h-7 flex-1 text-xs">Add</Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setValue(''); setOpen(false); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const KanbanBoard = ({ tasks, project, onTaskChange, onEdit, onDelete, onQuickAdd }) => {
  const { user, isAdmin } = useAuth();
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const canEditTaskStatus = (task) => isAdmin || task.assignedTo?._id === user._id;

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', task._id); } catch (_) {}
  };
  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };
  const handleDragOver = (e, columnId) => {
    if (!dragging) return;
    e.preventDefault();
    setDragOver(columnId);
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging || dragging.status === columnId) {
      setDragging(null);
      return;
    }
    if (!canEditTaskStatus(dragging)) {
      toast.error('You can only move tasks assigned to you');
      setDragging(null);
      return;
    }
    const movedTask = dragging;
    setDragging(null);
    try {
      await api.patch(`/tasks/${movedTask._id}/status`, { status: columnId });
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === columnId).label}`);
      onTaskChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = grouped[col.id];
        const isTarget = dragOver === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOver((prev) => (prev === col.id ? null : prev))}
            onDrop={(e) => handleDrop(e, col.id)}
            className={cn(
              'flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 transition-all',
              isTarget && 'border-primary/60 bg-primary/5 ring-2 ring-primary/30'
            )}
          >
            <div className={cn('relative', col.headerBg)}>
              <div className={cn('h-1 w-full', col.bar)} />
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', col.accent)} />
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <AnimatePresence mode="popLayout">
                {items.length === 0 && !isTarget ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground"
                  >
                    Drop tasks here
                  </motion.div>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isAdmin={isAdmin}
                      canEditStatus={canEditTaskStatus(task)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={dragging?._id === task._id}
                    />
                  ))
                )}
              </AnimatePresence>
              {isAdmin && <QuickAdd onAdd={onQuickAdd} status={col.id} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
