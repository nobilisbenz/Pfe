// js
const roleRestriction = (...roles) => {
  return (req, res, next) => {
    // Check if userAuth exists before accessing its properties
    if (!req.userAuth) {
      return res.status(401).json({
        status: "error",
        message: "You are not authenticated, please login",
      });
    }
    
    if (!roles.includes(req.userAuth.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });
    }
    
    next();
  };
};

module.exports = roleRestriction;
