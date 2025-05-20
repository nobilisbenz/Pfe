const express = require("express");
const {
  createFAQ,
  getAllFAQs,
  getFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../../controller/public/faqCtrl");
const isLogin = require("../../middlewares/isLogin");
const isAdmin = require("../../middlewares/isAdmin");

const faqRouter = express.Router();

faqRouter
  .route("/")
  .get(getAllFAQs)
  .post(isLogin, isAdmin, createFAQ);

faqRouter
  .route("/:id")
  .get(getFAQ)
  .put(isLogin, isAdmin, updateFAQ)
  .delete(isLogin, isAdmin, deleteFAQ);

module.exports = faqRouter;