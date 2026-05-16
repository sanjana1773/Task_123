const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('User with this email already exists');
  }

  // First registered user gets 'admin' to bootstrap the system; otherwise honor input or default to 'member'.
  const userCount = await User.countDocuments();
  const assignedRole = userCount === 0 ? 'admin' : role === 'admin' ? 'admin' : 'member';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole,
  });

  res.status(201).json({
    user: user.toSafeJSON(),
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    user: user.toSafeJSON(),
    token: generateToken(user._id),
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// GET /api/auth/users  (admin helper for member assignment)
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json({ users: users.map((u) => u.toSafeJSON()) });
});

module.exports = { signup, login, getMe, listUsers };
