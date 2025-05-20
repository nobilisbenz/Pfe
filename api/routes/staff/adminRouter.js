const express = require("express");
const {
  registerAdmCtrl,
  loginAdminCtrl,
  getAdminsCtrl,
  getAdminProfileCtrl,
  updateAdminCtrl,
  deleteAdminCtrl,
  getAllUsersCtrl,
  adminSuspendTeacherCtrl,
  adminUnSuspendTeacherCtrl,
  adminWithdrawTeacherCtrl,
  adminUnWithdrawTeacherCtrl,
  adminPublishResultsCtrl,
  adminUnPublishResultsCtrl,
} = require("../../controller/staff/adminCtrl");

const isAuthenticated = require("../../middlewares/isAuthenticated");
const Admin = require("../../model/Staff/Admin");
const roleRestriction = require("../../middlewares/roleRestriction");

const adminRouter = express.Router();

adminRouter.post(
  "/register",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  registerAdmCtrl,
);

adminRouter.post("/login", loginAdminCtrl);

adminRouter.get(
  "/",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAdminsCtrl,
);

adminRouter.get(
  "/profile",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAdminProfileCtrl,
);

adminRouter.get(
  "/users",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAllUsersCtrl,
);

adminRouter.put(
  "/",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  updateAdminCtrl,
);

adminRouter.delete(
  "/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  deleteAdminCtrl,
);

//suspend
adminRouter.put(
  "/suspend/teacher/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminSuspendTeacherCtrl,
);

//unsuspend
adminRouter.put(
  "/unsuspend/teacher/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminUnSuspendTeacherCtrl,
);

//withdraw
adminRouter.put(
  "/withdraw/teacher/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminWithdrawTeacherCtrl,
);

//unwithdraw
adminRouter.put(
  "/unwithdraw/teacher/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminUnWithdrawTeacherCtrl,
);

//publish exams
adminRouter.put(
  "/publish/exam/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminPublishResultsCtrl,
);

//unpublish exams results
adminRouter.put(
  "/unpublish/exam/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminUnPublishResultsCtrl,
);

module.exports = adminRouter;
