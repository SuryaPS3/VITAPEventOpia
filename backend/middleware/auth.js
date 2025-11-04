import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

export const authorize = (...args) => {
  const roles = args.filter(arg => typeof arg === 'string');
  const validator = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user authenticated.'
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    if (validator) {
      try {
        const isAuthorized = await validator(req);
        if (!isAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to perform this action.'
          });
        }
      } catch (error) {
        console.error('Authorization validator error:', error);
        return res.status(500).json({
          success: false,
          message: 'An error occurred during authorization.'
        });
      }
    }

    next();
  };
};