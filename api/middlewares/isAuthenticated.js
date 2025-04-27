const verifyToken = require("../utils/verifyToken");

const isAuthenticated = model => {
  return async (req, res, next) => {
    //get token from header
    const headerObj = req.headers;
    const token = headerObj?.authorization?.split(" ")[1];

    //verify token
    const verifiedToken = verifyToken(token);
    if (verifiedToken) {
      //find the user by id
      const user = await model.findById(verifiedToken.id);
      
      if (!user) {
        const err = new Error("User not found");
        return next(err);
      }
      
      // Create a simplified user object with only necessary fields
      req.userAuth = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      next();
    } else {
      const err = new Error("Token expired/invalid");
      next(err);
    }
  };
};

module.exports = isAuthenticated;
