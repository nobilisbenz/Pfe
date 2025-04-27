const express = require("express");
const {
  registerAdmCtrl,
  loginAdminCtrl,
  getAdminsCtrl,
  getAdminProfileCtrl,
  updateAdminCtrl,
  deleteAdminCtrl,
} = require("../../controller/staff/adminCtrl");

const isAuthenticated = require("../../middlewares/isAuthenticated");
const isAdmin = require("../../middlewares/isAdmin");
const Admin = require("../../model/staff/admin");
const roleRestriction = require("../../middlewares/roleRestriction");

const adminRouter = express.Router();

adminRouter.post("/register", registerAdmCtrl);
adminRouter.post("/login", loginAdminCtrl);
adminRouter.get("/", isAuthenticated(Admin), getAdminsCtrl);
adminRouter.get("/profile", isAuthenticated(Admin), getAdminProfileCtrl);
adminRouter.get("/users", isAuthenticated(Admin), roleRestriction("admin"), getAllUsersCtrl);
adminRouter.put("/", isAuthenticated(Admin), updateAdminCtrl);
adminRouter.delete("/:id", isAuthenticated(Admin), deleteAdminCtrl);


module.exports = adminRouter;
