import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Edit3, KanbanSquare, List, ListChecks, MoreHorizontal, Pencil, Plus, Trash2, Users,
} from 'lucide-react';
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
import { Separator } from '../components/ui/Separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/Dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/Select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '../components/ui/DropdownMenu';
import EmptyState from '../components/EmptyState';
import { NoTasksIllustration } from '../components/illustrations';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import KanbanBoard from '../components/KanbanBoard';
import { cn } from '../lib/utils';

const blankTaskForm = {
  title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '',
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', members: [] });
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(blankTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [view, setView] = useState(() => localStorage.getItem('ttm_project_view') || 'board');
  useEffect(() => { localStorage.setItem('ttm_project_view', view); }, [view]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setData(res.data);
      setProjectForm({
        title: res.data.project.title,
        description: res.data.project.description || '',
        members: (res.data.project.members || []).map((m) => m._id),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project');
      if (err.response?.status === 404 || err.response?.status === 403) navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/auth/users').then((r) => setUsers(r.data.users)).catch(() => {});
  }, [isAdmin]);

  const openCreateTask = () => {
    setEditingTaskId(null);
    setTaskForm(blankTaskForm);
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setTaskModalOpen(true);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      project: id,
      dueDate: taskForm.dueDate || null,
      assignedTo: taskForm.assignedTo || null,
    };
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }
      setTaskModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const changeStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const saveProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, projectForm);
      toast.success('Project updated');
      setEditProjectOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const quickAddTask = async (title, status) => {
    try {
      await api.post('/tasks', { title, status, priority: 'medium', project: id });
      toast.success('Task added');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const toggleMember = (uid) => {
    setProjectForm((f) => ({
      ...f,
      members: f.members.includes(uid) ? f.members.filter((m) => m !== uid) : [...f.members, uid],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-80" />
      </div>
    );
  }
  if (!data) return null;

  const { project, tasks, progress, taskStats } = data;
  const canEditStatus = (task) => isAdmin || task.assignedTo?._id === user._id;
  const isOverdue = (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="mt-1">{project.description || 'No description'}</CardDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditProjectOpen(true)}>
                  <Pencil /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteProjectOpen(true)}>
                  <Trash2 /> Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Overall progress</div>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={progress} className="h-2.5 flex-1" />
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Total</div>
                <div className="mt-1 text-lg font-semibold">{taskStats.total}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">In progress</div>
                <div className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">{taskStats.inProgress}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Completed</div>
                <div className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{taskStats.completed}</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Members</div>
              <span className="text-xs text-muted-foreground">{project.members?.length || 0}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(project.members || []).length === 0 ? (
                <span className="text-sm text-muted-foreground">No members assigned.</span>
              ) : (
                project.members.map((m) => (
                  <div key={m._id} className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`text-[10px] ${colorForKey(m._id)}`}>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{m.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Tasks</h2>
          <Badge variant="muted">{tasks.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView('board')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                view === 'board' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={view === 'board'}
            >
              <KanbanSquare className="h-3.5 w-3.5" /> Board
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                view === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={view === 'list'}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          {isAdmin && (
            <Button onClick={openCreateTask}><Plus /> New task</Button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          illustration={NoTasksIllustration}
          title="No tasks yet"
          message={isAdmin ? 'Create your first task to start tracking progress.' : 'No tasks have been assigned in this project.'}
          action={isAdmin && <Button onClick={openCreateTask}><Plus /> New task</Button>}
        />
      ) : view === 'board' ? (
        <KanbanBoard
          tasks={tasks}
          project={project}
          onTaskChange={load}
          onEdit={openEditTask}
          onDelete={deleteTask}
          onQuickAdd={quickAddTask}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((t) => (
                  <tr key={t._id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{t.title}</div>
                      {t.description && <div className="line-clamp-1 text-xs text-muted-foreground">{t.description}</div>}
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
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEditTask(t)}><Edit3 /> Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => deleteTask(t._id)} className="text-destructive focus:text-destructive">
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Task modal */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTaskId ? 'Edit task' : 'Create task'}</DialogTitle>
            <DialogDescription>Set the details and assignee for this task.</DialogDescription>
          </DialogHeader>
          <form id="task-form" onSubmit={submitTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-title">Title</Label>
              <Input id="t-title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea id="t-desc" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} maxLength={2000} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-due">Due date</Label>
                <Input id="t-due" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={taskForm.assignedTo || 'unassigned'} onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v === 'unassigned' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(project.members || []).map((m) => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModalOpen(false)}>Cancel</Button>
            <Button form="task-form" type="submit">{editingTaskId ? 'Save changes' : 'Create task'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit project */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update project info and members.</DialogDescription>
          </DialogHeader>
          <form id="edit-project-form" onSubmit={saveProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ep-title">Title</Label>
              <Input id="ep-title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-desc">Description</Label>
              <Textarea id="ep-desc" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} maxLength={2000} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Members</Label>
              <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background p-2">
                {users.length === 0 ? (
                  <p className="px-2 py-3 text-center text-sm text-muted-foreground">No users available.</p>
                ) : (
                  users.map((u) => (
                    <label key={u._id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                      <input
                        type="checkbox"
                        checked={projectForm.members.includes(u._id)}
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
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectOpen(false)}>Cancel</Button>
            <Button form="edit-project-form" type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete project confirmation */}
      <Dialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{project.title}</span> and all of its tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteProject}>
              <Trash2 /> Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
