const ensureAuthenticated = (req, res, next) => {
  const logContext = {
    sessionID: req.sessionID,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
      'user-agent': req.headers['user-agent']
    }
  };

  console.log('Auth Middleware: Authentication check', {
    ...logContext,
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    } : null
  });

  if (req.isAuthenticated()) {
    console.log('Auth Middleware: Authentication successful', logContext);
    return next();
  }

  console.error('Auth Middleware: Authentication failed', logContext);
  res.status(401).json({
    code: 'AUTH_UNAUTHORIZED',
    message: 'Authentication required',
    details: {
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

const ensureRole = (role) => {
  return (req, res, next) => {
    console.log('Role Middleware: Checking role', {
      required: role,
      userRole: req.user?.role,
      user: req.user
    });
    
    if (req.isAuthenticated() && req.user.role === role) {
      console.log('Role Middleware: Access granted');
      return next();
    }
    console.log('Role Middleware: Access denied');
    res.status(403).json({ message: 'Insufficient permissions' });
  };
};

module.exports = { ensureAuthenticated, ensureRole }; 