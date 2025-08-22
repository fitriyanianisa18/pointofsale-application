const logoutMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.logoutToken = authHeader.split(' ')[1];
      next();
    } else {
      return res.status(400).json({ message: 'Token tidak ditemukan.' });
    }
  };
  
  module.exports = logoutMiddleware;