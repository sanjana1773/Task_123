import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  CheckSquare, FolderKanban, LayoutDashboard, Loader2, LogOut, Moon, Search, Sun, User as UserIcon,
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const CommandPalette = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data when palette opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get('/projects', { params: { limit: 50 } }).catch(() => ({ data: { projects: [] } })),
      api.get('/tasks', { params: { limit: 50 } }).catch(() => ({ data: { tasks: [] } })),
    ])
      .then(([p, t]) => {
        if (!mounted) return;
        setProjects(p.data.projects || []);
        setTasks(t.data.tasks || []);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [open]);

  const run = useCallback((fn) => () => {
    onOpenChange(false);
    setQuery('');
    setTimeout(fn, 50);
  }, [onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[20%] z-50 w-full max-w-xl translate-x-[-50%] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <Command
            className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground"
            shouldFilter={true}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search projects, tasks, or run a command..."
                className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                <Command.Item value="go dashboard home" onSelect={run(() => navigate('/dashboard'))} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Go to Dashboard
                </Command.Item>
                <Command.Item value="go projects" onSelect={run(() => navigate('/projects'))} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" /> Go to Projects
                </Command.Item>
                <Command.Item value="go tasks" onSelect={run(() => navigate('/tasks'))} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" /> Go to Tasks
                </Command.Item>
                <Command.Item value="go profile account" onSelect={run(() => navigate('/profile'))} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
                  <UserIcon className="h-4 w-4 text-muted-foreground" /> Go to Profile
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Quick actions" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                <Command.Item value="toggle theme dark light mode" onSelect={run(toggleTheme)} className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    Toggle {theme === 'dark' ? 'light' : 'dark'} mode
                  </span>
                </Command.Item>
                <Command.Item value="log out sign out" onSelect={run(logout)} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive aria-selected:bg-destructive/10">
                  <LogOut className="h-4 w-4" /> Log out
                </Command.Item>
              </Command.Group>

              {projects.length > 0 && (
                <Command.Group heading="Projects" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                  {projects.map((p) => (
                    <Command.Item
                      key={p._id}
                      value={`project ${p.title}`}
                      onSelect={run(() => navigate(`/projects/${p._id}`))}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{p.title}</span>
                      </span>
                      <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                        {p.progress || 0}% · {p.members?.length || 0} members
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {tasks.length > 0 && (
                <Command.Group heading="Tasks" className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                  {tasks.slice(0, 12).map((t) => (
                    <Command.Item
                      key={t._id}
                      value={`task ${t.title} ${t.project?.title || ''}`}
                      onSelect={run(() => navigate(`/projects/${t.project?._id}`))}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CheckSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{t.title}</span>
                      </span>
                      <span className="ml-2 shrink-0 truncate text-[11px] text-muted-foreground">
                        {t.project?.title || ''}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-background px-1 font-mono">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-background px-1 font-mono">↵</kbd> select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 font-mono">⌘K</kbd> toggle
              </span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CommandPalette;
