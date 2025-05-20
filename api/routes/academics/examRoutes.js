// js
const express = require("express");
const {
  createExam,
  getExams,
  getExam,
  updatExam,
  deleteExam,
} = require("../../controller/academics/examsCtrl");
const isTeacher = require("../../middlewares/isTeacher");
const isTeacherLogin = require("../../middlewares/isTeacherLogin");

const examRouter = express.Router();

examRouter
  .route("/")
  .post(isTeacherLogin, isTeacher, createExam)
  .get(isTeacherLogin, isTeacher, getExams);

examRouter
  .route("/:id")
  .get(isTeacherLogin, isTeacher, getExam)
  .put(isTeacherLogin, isTeacher, updatExam);

examRouter
  .route("/:id")
  .get(isTeacherLogin, isTeacher, getExam)
  .delete(isTeacherLogin, isTeacher, deleteExam);

module.exports = examRouter;
