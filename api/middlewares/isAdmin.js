const Admin = require("../model/staff/admin");

const isAdmin = async (req, res, next) => {
  //find the user
  const userId = req?.userAuth?.id;
  const adminFound = await Admin.findById(userId);
  //check if admin
  if (adminFound?.role === "admin") {
    next();
  } else {
    next(new Error("Access Denied, admin only"));
  }
};

module.exports = isAdmin;
