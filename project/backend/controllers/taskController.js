const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Project = require('../models/Project');

const isAdmin = (user) => user.role === 'admin';

const userCanAccessProject = (project, user) => {
  if (isAdmin(user)) return true;
  const uid = user._id.toString();
  if (project.createdBy && project.createdBy.toString() === uid) return true;
  return (project.members || []).some((m) => m.toString() === uid);
};

// GET /api/tasks?project=&status=&priority=&assignedTo=&search=&page=&limit=
const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { status, priority, assignedTo, project, search } = req.query;

  const filter = {};

  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.title = new RegExp(search.trim(), 'i');

  // Members only see tasks in projects they belong to.
  if (!isAdmin(req.user)) {
    const accessible = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select('_id');
    filter.project = filter.project
      ? filter.project
      : { $in: accessible.map((p) => p._id) };
  }

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    tasks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

// POST /api/tasks  (admin only)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    project,
    createdBy: req.user._id,
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
    { path: 'project', select: 'title' },
  ]);

  res.status(201).json({ task: populated });
});

// PUT /api/tasks/:id  (admin only)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'project'];
  for (const f of fields) {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  }

  await task.save();
  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
    { path: 'project', select: 'title' },
  ]);

  res.json({ task: populated });
});

// DELETE /api/tasks/:id  (admin only)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  await task.deleteOne();
  res.json({ message: 'Task deleted', id: req.params.id });
});

// PATCH /api/tasks/:id/status  (admin always; member only if assigned)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const isAssignee =
    task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin(req.user) && !isAssignee) {
    res.status(403);
    throw new Error('You can only update the status of tasks assigned to you');
  }

  task.status = status;
  await task.save();

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
    { path: 'project', select: 'title' },
  ]);

  res.json({ task: populated });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
