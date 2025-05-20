const express = require("express");
const {
  adminRegisterTeacher,
  loginTeacher,
  getAllTeachersAdmin,
  getTeacherByAdmin,
  getTeacherProfile,
  teacherUpdateProfile,
  adminUpdateTeacher,
  deleteTeacher,
} = require("../../controller/staff/teachersCtrl");
const isAdmin = require("../../middlewares/isAdmin");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const isLogin = require("../../middlewares/isLogin");
const roleRestriction = require("../../middlewares/roleRestriction");
const Admin = require("../../model/Staff/Admin");
const Teacher = require("../../model/Staff/Teacher");

const teachersRouter = express.Router();

teachersRouter.post("/admin/register", isLogin, isAdmin, adminRegisterTeacher);
teachersRouter.post("/login", loginTeacher);

teachersRouter.get(
  "/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAllTeachersAdmin,
);

teachersRouter.get(
  "/profile",
  isAuthenticated(Teacher),
  roleRestriction("teacher"),
  getTeacherProfile,
);

teachersRouter.get(
  "/:teacherID/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getTeacherByAdmin,
);

teachersRouter.put(
  "/update",
  isAuthenticated(Teacher),
  roleRestriction("teacher"),
  teacherUpdateProfile,
);

teachersRouter.put(
  "/:teacherID/update/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminUpdateTeacher,
);

teachersRouter.delete(
  "/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  deleteTeacher,
);

module.exports = teachersRouter;
