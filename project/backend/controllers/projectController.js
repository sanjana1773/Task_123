const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Task = require('../models/Task');

const isAdmin = (user) => user.role === 'admin';

const userCanAccessProject = (project, user) => {
  if (isAdmin(user)) return true;
  const uid = user._id.toString();
  if (project.createdBy && project.createdBy.toString() === uid) return true;
  return (project.members || []).some((m) => m.toString() === uid);
};

// GET /api/projects?page=&limit=&search=
const getProjects = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const search = (req.query.search || '').trim();

  const filter = {};
  if (!isAdmin(req.user)) {
    filter.$or = [{ createdBy: req.user._id }, { members: req.user._id }];
  }
  if (search) {
    const regex = new RegExp(search, 'i');
    const searchOr = [{ title: regex }, { description: regex }];
    filter.$and = [{ $or: filter.$or || [{}] }, { $or: searchOr }];
    delete filter.$or;
  }

  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Compute progress for each project.
  const projectIds = projects.map((p) => p._id);
  const taskCounts = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { project: '$project', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const byProject = {};
  for (const row of taskCounts) {
    const pid = row._id.project.toString();
    byProject[pid] = byProject[pid] || { total: 0, completed: 0 };
    byProject[pid].total += row.count;
    if (row._id.status === 'completed') byProject[pid].completed += row.count;
  }

  const projectsWithProgress = projects.map((p) => {
    const stats = byProject[p._id.toString()] || { total: 0, completed: 0 };
    const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
    return { ...p.toObject(), taskStats: stats, progress };
  });

  res.json({
    projects: projectsWithProgress,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

// POST /api/projects  (admin only)
const createProject = asyncHandler(async (req, res) => {
  const { title, description, members = [] } = req.body;

  const project = await Project.create({
    title,
    description,
    members,
    createdBy: req.user._id,
  });

  const populated = await project.populate([
    { path: 'members', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
  ]);

  res.status(201).json({ project: populated });
});

// GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email role');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (!userCanAccessProject(project, req.user)) {
    res.status(403);
    throw new Error('You do not have access to this project');
  }

  const tasks = await Task.find({ project: project._id })
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json({
    project,
    tasks,
    taskStats: { total, completed, inProgress: tasks.filter((t) => t.status === 'in_progress').length, todo: tasks.filter((t) => t.status === 'todo').length },
    progress,
  });
});

// PUT /api/projects/:id  (admin only)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const { title, description, members } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (Array.isArray(members)) project.members = members;

  await project.save();
  const populated = await project.populate([
    { path: 'members', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
  ]);

  res.json({ project: populated });
});

// DELETE /api/projects/:id  (admin only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted', id: req.params.id });
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
