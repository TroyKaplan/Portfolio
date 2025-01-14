const ensureAuthenticated = (req, res, next) => {
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('Auth check - user:', req.user);
  
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

const ensureRole = (role) => {
  return (req, res, next) => {
    console.log('Role check - user role:', req.user?.role);
    console.log('Required role:', role);
    
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: 'Insufficient permissions' });
  };
};

module.exports = { ensureAuthenticated, ensureRole }; 