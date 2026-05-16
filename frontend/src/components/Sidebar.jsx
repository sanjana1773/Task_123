import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, User, X, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ open, onClose }) => {
  const { user, isAdmin } = useAuth();
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="relative flex h-16 items-center justify-between overflow-hidden border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-hero text-white shadow-lg shadow-primary/30">
              <span className="text-sm font-bold">T</span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight gradient-text-rainbow">Team Tasks</div>
              <div className="text-[11px] text-muted-foreground">Workspace</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full gradient-hero" />}
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="relative overflow-hidden rounded-xl border border-border gradient-violet-pink p-4 text-white shadow-md shadow-primary/20">
            <Sparkles className="absolute right-3 top-3 h-4 w-4 text-white/60" />
            <div className="text-xs font-semibold">
              {isAdmin ? 'Workspace admin' : 'Team member'}
            </div>
            <p className="mt-1 text-xs leading-snug text-white/85">
              {isAdmin ? 'You can create projects and assign tasks.' : 'Update status on your assigned tasks.'}
            </p>
            <Badge className="mt-2 border-white/30 bg-white/20 capitalize text-white">
              {user?.role}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
