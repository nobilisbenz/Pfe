const express = require("express");
const { getDashboardStats } = require("../../controller/academics/statsCtrl");
const isAdmin = require("../../middlewares/isAdmin");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const Admin = require("../../model/Staff/Admin");

const statsRouter = express.Router();

statsRouter.get("/", isAuthenticated(Admin), isAdmin, getDashboardStats);

module.exports = statsRouter;