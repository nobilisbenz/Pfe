const express = require("express");

const adminRouter = express.Router();

adminRouter.post("/register", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "Admin has been registered",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.post("/login", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "Admin has been login",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.get("/", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "All admins",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.get("/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "Single admins",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.put("/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "update admin",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.delete("/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: "delete admin",
    });
  } catch (error) {
    res.json({
      status: "failed",
    });
  }
});

adminRouter.put("/suspend/teacher/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin suspend teacher",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

adminRouter.put("/unsuspend/teacher/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin Unsuspend teacher",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

adminRouter.put("/withdraw/teacher/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin withdraw teacher",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

adminRouter.put("/unwithdraw/teacher/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin Unwithdraw teacher",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

adminRouter.put("/publish/exam/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin publish exam",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

adminRouter.put("/unpublish/exam/:id", (req, res) => {
  try {
    res.status(201).json({
      status: "success",
      data: " admin unpublish exam",
    });
  } catch (error) {
    res.json({
      status: "failed",
      error: error.message,
    });
  }
});

module.exports = adminRouter;
