const authorize = (roles) => {
  return (req, res, next) => {
    try {
       if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "No user found in request",
        });
      }
      
      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = authorize;
