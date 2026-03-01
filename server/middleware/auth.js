import jwt from 'jsonwebtoken';

/**
 * Auth middleware - verifies the Bearer JWT from the Authorization header.
 * On success, attaches the decoded payload as `req.user` so downstream
 * route handlers can access `req.user.id` and `req.user.role`.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ error: 'Forbidden: user role missing.' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
  }

  return next();
};

export default authMiddleware;
