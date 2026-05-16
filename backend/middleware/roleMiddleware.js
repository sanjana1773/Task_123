// Restricts a route to one or more roles. Usage: authorize('admin') or authorize('admin', 'member').
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Forbidden: requires role [${allowedRoles.join(', ')}]`));
    }
    next();
  };
};

module.exports = { authorize };
