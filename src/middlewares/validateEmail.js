const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const requireEmail = (req, res, next) => {
  if (!req.user?.email) {
    return res.status(400).json({
      error: 'Email required',
      code: 'EMAIL_REQUIRED'
    });
  }
  next();
};

module.exports = {
  validateEmail,
  requireEmail
}; 