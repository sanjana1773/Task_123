import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Avatar, AvatarFallback, colorForKey, initials } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/Select';
import EmptyState from '../components/EmptyState';
import { NoSearchIllustration, NoTasksIllustration } from '../components/illustrations';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

const Tasks = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const canEditStatus = (task) => isAdmin || task.assignedTo?._id === user._id;
  const isOverdue = (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();

  const clearFilters = () => {
    setPage(1);
    setFilters({ status: 'all', priority: 'all', search: '' });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {pagination.total} task{pagination.total === 1 ? '' : 's'} across your projects
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={filters.status} onValueChange={(v) => { setPage(1); setFilters((f) => ({ ...f, status: v })); }}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <Select value={filters.priority} onValueChange={(v) => { setPage(1); setFilters((f) => ({ ...f, priority: v })); }}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <Filter /> Clear
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          illustration={hasActiveFilters ? NoSearchIllustration : NoTasksIllustration}
          title={hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
          message={hasActiveFilters ? 'Try adjusting the filters above.' : 'Create a task from any project to see it here.'}
        />
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((t) => (
                    <tr key={t._id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{t.title}</td>
                      <td className="px-4 py-3">
                        {t.project ? (
                          <Link to={`/projects/${t.project._id}`} className="text-sm text-muted-foreground hover:text-primary">
                            {t.project.title}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {t.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className={`text-[10px] ${colorForKey(t.assignedTo._id)}`}>{initials(t.assignedTo.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{t.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-4 py-3">
                        {canEditStatus(t) ? (
                          <Select value={t.status} onValueChange={(v) => changeStatus(t._id, v)}>
                            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <StatusBadge status={t.status} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.dueDate ? (
                          <span className={`inline-flex items-center gap-1.5 text-sm ${isOverdue(t) ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        ) : <span className="text-sm text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft /> Previous
              </Button>
              <span className="px-3 text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tasks;
