const express = require("express");
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCoursesByProgram
} = require("../../controller/academics/coursesCtrl");
const isAdmin = require("../../middlewares/isAdmin");
const isLogin = require("../../middlewares/isLogin");

const courseRouter = express.Router();

courseRouter
  .route("/")
  .post(isLogin, isAdmin, createCourse)
  .get(getCourses);

courseRouter
  .route("/program/:programId")
  .get(getCoursesByProgram);

courseRouter
  .route("/:id")
  .get(getCourse)
  .put(isLogin, isAdmin, updateCourse)
  .delete(isLogin, isAdmin, deleteCourse);

module.exports = courseRouter;