const express = require("express");
const {
  adminRegisterStudent,
  loginStudent,
  getStudentProfile,
  getAllStudentsByAdmin,
  getStudentByAdmin,
  studentUpdateProfile,
  adminUpdateStudent,
  writeExam,
  deleteStudent,
} = require("../../controller/students/studentsCtrl");

const isAuthenticated = require("../../middlewares/isAuthenticated");
const roleRestriction = require("../../middlewares/roleRestriction");
const Student = require("../../model/Academic/Student");
const Admin = require("../../model/Staff/Admin");
const studentRouter = express.Router();

studentRouter.post(
  "/admin/register",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminRegisterStudent,
);
studentRouter.post("/login", loginStudent);
studentRouter.get(
  "/profile",
  isAuthenticated(Student),
  roleRestriction("student"),
  getStudentProfile,
);
studentRouter.get(
  "/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAllStudentsByAdmin,
);
studentRouter.get(
  "/:studentID/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getStudentByAdmin,
);
studentRouter.post(
  "/exam/:examID/write",
  isAuthenticated(Student),
  roleRestriction("student"),
  writeExam,
);
studentRouter.put(
  "/update",
  isAuthenticated(Student),
  roleRestriction("student"),
  studentUpdateProfile,
);
studentRouter.put(
  "/:studentID/update/admin",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminUpdateStudent,
);
studentRouter.delete(
  "/:id",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  deleteStudent,
);

module.exports = studentRouter;
