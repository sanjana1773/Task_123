import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FolderKanban, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Avatar, AvatarFallback, colorForKey, initials } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/Dialog';
import EmptyState from '../components/EmptyState';
import { NoProjectsIllustration } from '../components/illustrations';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [users, setUsers] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', members: [] });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { page, limit: 9, search: search || undefined } });
      setProjects(res.data.projects);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/auth/users').then((r) => setUsers(r.data.users)).catch(() => {});
  }, [isAdmin]);

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created');
      setCreateOpen(false);
      setForm({ title: '', description: '', members: [] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} project{pagination.total === 1 ? '' : 's'} in your workspace
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-64 pl-9"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
          {isAdmin && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus /> New project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create project</DialogTitle>
                  <DialogDescription>Set up a project and invite members.</DialogDescription>
                </DialogHeader>
                <form id="create-project-form" onSubmit={onCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cp-title">Title</Label>
                    <Input id="cp-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} placeholder="e.g. Q3 Launch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp-desc">Description</Label>
                    <Textarea id="cp-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} placeholder="What's this project about?" />
                  </div>
                  <div className="space-y-2">
                    <Label>Members</Label>
                    <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background p-2">
                      {users.length === 0 ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">No other users available.</p>
                      ) : (
                        users.map((u) => {
                          const selected = form.members.includes(u._id);
                          return (
                            <label key={u._id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMember(u._id)}
                                className="h-4 w-4 accent-primary"
                              />
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className={colorForKey(u._id)}>{initials(u.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{u.name}</div>
                                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                              </div>
                              {u.role === 'admin' && <Badge variant="info" className="text-[10px]">Admin</Badge>}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </form>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" form="create-project-form" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create project'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          illustration={NoProjectsIllustration}
          title="No projects yet"
          message={isAdmin ? 'Create your first project to start tracking tasks.' : 'You have not been added to any projects yet.'}
          action={isAdmin && (
            <Button onClick={() => setCreateOpen(true)}><Plus /> New project</Button>
          )}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`} className="group">
                <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1 group-hover:text-primary">{p.title}</CardTitle>
                      <Badge variant="muted">{p.taskStats?.total || 0} tasks</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {p.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{p.progress || 0}%</span>
                      </div>
                      <Progress value={p.progress || 0} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {(p.members || []).slice(0, 4).map((m) => (
                          <Avatar key={m._id} className="h-7 w-7 border-2 border-card">
                            <AvatarFallback className={`text-[10px] ${colorForKey(m._id)}`}>
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(p.members?.length || 0) > 4 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                            +{p.members.length - 4}
                          </div>
                        )}
                        {(p.members?.length || 0) === 0 && (
                          <span className="text-xs text-muted-foreground">No members</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.taskStats?.completed || 0}/{p.taskStats?.total || 0} done
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft /> Previous
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
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

export default Projects;
