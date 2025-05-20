const express = require("express");
const { sendSMS, sendBulkSMS } = require("../../controller/notification/smsController");
const isAdmin = require("../../middlewares/isAdmin");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const Admin = require("../../model/Staff/Admin");
const roleRestriction = require("../../middlewares/roleRestriction");

const smsRouter = express.Router();

smsRouter.post("/send", isAuthenticated(Admin), roleRestriction("admin"), sendSMS);
smsRouter.post("/send-bulk", isAuthenticated(Admin), roleRestriction("admin"), sendBulkSMS);

module.exports = smsRouter;