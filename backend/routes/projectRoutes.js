const express = require('express');
const { body, param } = require('express-validator');

const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Title required (max 120)'),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('members').optional().isArray().withMessage('members must be an array of user IDs'),
    body('members.*').optional().isMongoId().withMessage('Invalid member ID'),
  ],
  validate,
  createProject
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  getProjectById
);

router.put(
  '/:id',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('members').optional().isArray(),
    body('members.*').optional().isMongoId(),
  ],
  validate,
  updateProject
);

router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  deleteProject
);

module.exports = router;
