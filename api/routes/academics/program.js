const express = require("express");
const {
  createProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  updateProgram,
  addSubjectToProgram,
  updateProgramSchedule
} = require("../../controller/academics/programs");
const isAdmin = require("../../middlewares/isAdmin");
const isLogin = require("../../middlewares/isLogin");

const programRouter = express.Router();

programRouter
  .route("/")
  .post(isLogin, isAdmin, createProgram)
  .get(isLogin, isAdmin, getPrograms);

programRouter
  .route("/:id")
  .get(isLogin, isAdmin, getProgram)
  .put(isLogin, isAdmin, updateProgram)
  .delete(isLogin, isAdmin, deleteProgram);

programRouter.put("/:id/subjects", isLogin, isAdmin, addSubjectToProgram);
programRouter.put("/:id/schedule", isLogin, isAdmin, updateProgramSchedule);

module.exports = programRouter;
