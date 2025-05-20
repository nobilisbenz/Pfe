const express = require("express");
const {
  createNews,
  getAllNews,
  getNews,
  updateNews,
  deleteNews,
} = require("../../controller/public/newsCtrl");
const isAdmin = require("../../middlewares/isAdmin");
const isLogin = require("../../middlewares/isLogin");

const newsRouter = express.Router();

newsRouter
  .route("/")
  .post(isLogin, isAdmin, createNews)
  .get(getAllNews);

newsRouter
  .route("/:id")
  .get(getNews)
  .put(isLogin, isAdmin, updateNews)
  .delete(isLogin, isAdmin, deleteNews);

module.exports = newsRouter;