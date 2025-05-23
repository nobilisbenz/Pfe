const express = require("express");
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updatQuestion,
  deleteQuestion,
} = require("../../controller/academics/questionsCtrl");
const isTeacher = require("../../middlewares/isTeacher");
const isTeacherLogin = require("../../middlewares/isTeacherLogin");

const questionsRouter = express.Router();

questionsRouter.get("/", isTeacherLogin, isTeacher, getQuestions);
questionsRouter.get("/:id", isTeacherLogin, isTeacher, getQuestion);
questionsRouter.post("/:examID", isTeacherLogin, isTeacher, createQuestion);
questionsRouter.put("/:id", isTeacherLogin, isTeacher, updatQuestion);
questionsRouter.delete("/:id", isTeacherLogin, isTeacher, deleteQuestion);

module.exports = questionsRouter;
