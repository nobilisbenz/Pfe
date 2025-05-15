const express = require("express");
const {
  registerAdminCtrl,
  loginAdminCtrl,
  getAllAdminCtrl,
  getAdminCtrl,
  updateAdminCtrl,
  deleteAdminCtrl,
  suspendAdminCtrl,
  unsuspendAdminCtrl,
  withdrawAdminCtrl,
  unwithdrawAdminCtrl,
  publishAdminCtrl,
  unpublishAdminCtrl,
} = require("../../controllers/Staff/admin.controller");

const isLogin = require("../../middlewares/isLogin");

const adminRouter = express.Router();

adminRouter.post("/register", registerAdminCtrl);
adminRouter.post("/login", loginAdminCtrl);
adminRouter.get("/", getAllAdminCtrl);
adminRouter.get("/profile", isLogin, getAdminCtrl);
adminRouter.put("/:id", updateAdminCtrl);
adminRouter.delete("/:id", deleteAdminCtrl);
adminRouter.put("/suspend/teacher/:id", suspendAdminCtrl);
adminRouter.put("/unsuspend/teacher/:id", unsuspendAdminCtrl);
adminRouter.put("/withdraw/teacher/:id", withdrawAdminCtrl);
adminRouter.put("/unwithdraw/teacher/:id", unwithdrawAdminCtrl);
adminRouter.put("/publish/exam/:id", publishAdminCtrl);
adminRouter.put("/unpublish/exam/:id", unpublishAdminCtrl);

module.exports = adminRouter;
