const authorize = (roles) => {
  return (req, res, next) => {
    try {
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
