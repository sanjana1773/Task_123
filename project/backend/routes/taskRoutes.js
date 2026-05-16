const express = require('express');
const { body, param } = require('express-validator');

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').isString().trim().isLength({ min: 1, max: 150 }).withMessage('Title required (max 150)'),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO date'),
    body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee ID'),
    body('project').isMongoId().withMessage('Valid project ID required'),
  ],
  validate,
  createTask
);

router.put(
  '/:id',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 150 }),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('assignedTo').optional({ nullable: true }).isMongoId(),
    body('project').optional().isMongoId(),
  ],
  validate,
  updateTask
);

router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  deleteTask
);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('status').isIn(['todo', 'in_progress', 'completed']).withMessage('Invalid status'),
  ],
  validate,
  updateTaskStatus
);

module.exports = router;
