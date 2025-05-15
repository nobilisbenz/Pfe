// app.js
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("./databases/mysql.db");
const {
  globalErrHandler,
  notFoundErr,
} = require("./middlewares/globalErrHandler");

const adminRouter = require("./routers/Staff/adminRouter.router");

const app = express();

//Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Routes
adminRouter;
app.use("/api/v1/admins", adminRouter);

// Route de test
app.get("/api/test", (req, res) => {
  res.json({ message: "API fonctionne correctement" });
});

//Error middlewares
app.use(notFoundErr);
app.use(globalErrHandler);

module.exports = app;
