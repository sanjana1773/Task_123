import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo, Sparkles, TrendingUp, ArrowRight,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Avatar, AvatarFallback, colorForKey, initials } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import EmptyState from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

const greetingForHour = (h) => {
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

const STAT_TONES = {
  violet: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30',
  fuchsia: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30',
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
  amber: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30',
  cyan: 'bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-lg shadow-cyan-500/30',
  rose: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30',
};

const StatCard = ({ label, value, icon: Icon, tone = 'violet', sub }) => (
  <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <CardContent className="p-5">
      <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', STAT_TONES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </CardContent>
  </Card>
);

const LoadingDashboard = () => (
  <div className="space-y-6">
    <Skeleton className="h-36 w-full" />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
    </div>
  </div>
);

// Vibrant chart palette
const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#d946ef', completed: '#10b981' };
const PRIORITY_COLORS = { low: '#06b6d4', medium: '#f59e0b', high: '#ec4899' };

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/dashboard/stats')
      .then((res) => mounted && setStats(res.data))
      .catch((err) => mounted && setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  if (loading) return <LoadingDashboard />;
  if (error) return <EmptyState icon={AlertTriangle} title="Couldn't load dashboard" message={error} />;
  if (!stats) return null;

  const { totals, statusBreakdown, priorityBreakdown, recentActivity } = stats;

  const pieData = [
    { name: 'To Do', value: statusBreakdown.todo, key: 'todo' },
    { name: 'In Progress', value: statusBreakdown.in_progress, key: 'in_progress' },
    { name: 'Completed', value: statusBreakdown.completed, key: 'completed' },
  ];
  const barData = [
    { name: 'Low', value: priorityBreakdown.low, key: 'low' },
    { name: 'Medium', value: priorityBreakdown.medium, key: 'medium' },
    { name: 'High', value: priorityBreakdown.high, key: 'high' },
  ];

  const completionRate = totals.tasks === 0 ? 0 : Math.round((totals.completed / totals.tasks) * 100);
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e1b2e' : '#e2e8f0';
  const tooltipBg = theme === 'dark' ? '#161224' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#2a2540' : '#e2e8f0';

  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Hero greeting band */}
      <Card className="relative overflow-hidden border-none gradient-hero text-white">
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full bg-pink-400/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
        <CardContent className="relative flex flex-wrap items-center justify-between gap-6 p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> {greeting}, {firstName || 'there'}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Here's what's happening today
            </h1>
            <p className="text-sm text-white/85">
              {totals.overdue > 0
                ? `${totals.overdue} task${totals.overdue === 1 ? '' : 's'} overdue — let's catch up.`
                : totals.inProgress > 0
                ? `${totals.inProgress} task${totals.inProgress === 1 ? '' : 's'} in progress across ${totals.projects} project${totals.projects === 1 ? '' : 's'}.`
                : 'You\'re all caught up. Time to plan what\'s next.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
              <div className="text-center">
                <div className="text-4xl font-bold leading-none">{completionRate}%</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/80">Complete</div>
              </div>
            </div>
            <Button asChild size="sm" className="bg-white text-violet-700 hover:bg-white/90">
              <Link to="/projects">View projects <ArrowRight /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Projects" value={totals.projects} icon={FolderKanban} tone="violet" />
        <StatCard label="Total Tasks" value={totals.tasks} icon={ListTodo} tone="cyan" />
        <StatCard label="Completed" value={totals.completed} icon={CheckCircle2} tone="emerald" />
        <StatCard label="In Progress" value={totals.inProgress} icon={Clock3} tone="fuchsia" />
        <StatCard label="To Do" value={totals.todo} icon={ListTodo} tone="amber" />
        <StatCard label="Overdue" value={totals.overdue} icon={AlertTriangle} tone="rose" sub={totals.overdue > 0 ? 'Needs attention' : null} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status breakdown</CardTitle>
                <CardDescription>Distribution of tasks across statuses</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                <TrendingUp className="h-3 w-3" /> Live
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {totals.tasks === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <defs>
                    <linearGradient id="grad-completed" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="grad-in_progress" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="grad-todo" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                  </defs>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
                    {pieData.map((entry) => (<Cell key={entry.key} fill={`url(#grad-${entry.key})`} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: axisColor }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Priority mix</CardTitle>
            <CardDescription>Task distribution by priority</CardDescription>
          </CardHeader>
          <CardContent>
            {totals.tasks === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <defs>
                    <linearGradient id="bar-low" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                    <linearGradient id="bar-medium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="bar-high" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.06)' }} contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {barData.map((entry) => (<Cell key={entry.key} fill={`url(#bar-${entry.key})`} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest task updates across your projects</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tasks">View all <ArrowRight /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent tasks.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentActivity.map((task) => (
                <li key={task._id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={colorForKey(task.assignedTo?._id || 'x')}>
                        {initials(task.assignedTo?.name || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link to={`/projects/${task.project?._id}`} className="block truncate text-sm font-medium hover:text-primary">
                        {task.title}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">
                        {task.project?.title || 'Unknown project'} · {task.assignedTo?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
