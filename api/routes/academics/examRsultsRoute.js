// js
const express = require("express");
const {
  checkExamResults,
  getAllExamResults,
  adminToggleExamResult,
} = require("../../controller/academics/examResults");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const roleRestriction = require("../../middlewares/roleRestriction");
const Student = require("../../model/Academic/Student");
const Admin = require("../../model/Staff/Admin");

const examResultRouter = express.Router();

examResultRouter.get(
  "/",
  isAuthenticated(Student),
  roleRestriction("student"),
  getAllExamResults,
);

examResultRouter.get(
  "/:id/checking",
  isAuthenticated(Student),
  roleRestriction("student"),
  checkExamResults,
);

examResultRouter.put(
  "/:id/admin-toggle-publish",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  adminToggleExamResult,
);

module.exports = examResultRouter;
