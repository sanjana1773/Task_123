const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Project = require('../models/Project');

const isAdmin = (user) => user.role === 'admin';

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const taskFilter = {};
  const projectFilter = {};

  if (!isAdmin(req.user)) {
    const accessible = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select('_id');
    const accessibleIds = accessible.map((p) => p._id);
    taskFilter.project = { $in: accessibleIds };
    projectFilter._id = { $in: accessibleIds };
  }

  const now = new Date();

  const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, projectCount, recentTasks] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: 'completed' }),
    Task.countDocuments({ ...taskFilter, status: 'in_progress' }),
    Task.countDocuments({ ...taskFilter, status: 'todo' }),
    Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'completed' },
      dueDate: { $ne: null, $lt: now },
    }),
    Project.countDocuments(projectFilter),
    Task.find(taskFilter)
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('assignedTo', 'name email')
      .populate('project', 'title'),
  ]);

  // Priority breakdown (for charts)
  const priorityAgg = await Task.aggregate([
    { $match: taskFilter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const priorityBreakdown = { low: 0, medium: 0, high: 0 };
  for (const row of priorityAgg) {
    if (row._id) priorityBreakdown[row._id] = row.count;
  }

  res.json({
    totals: {
      tasks: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      overdue: overdueTasks,
      projects: projectCount,
    },
    statusBreakdown: {
      todo: todoTasks,
      in_progress: inProgressTasks,
      completed: completedTasks,
    },
    priorityBreakdown,
    recentActivity: recentTasks,
  });
});

module.exports = { getStats };
