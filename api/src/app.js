// app.js
const express = require("express");
// const morgan = require("morgan");
const cors = require("cors");

const app = express();

// app.use(morgan("dev"));

// const apiRouter = require("./routers/api.router");

require("./databases/mysql.db");

app.use(express.json());

const NODE_ENV = process.env.NODE_ENV || "development";
const whitelist = [];
const corsOptions = {
  origin: function (origin = "", callback) {
    if (whitelist.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET, POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(NODE_ENV === "development" ? cors() : cors(corsOptions));

// app.get("/", (req, res) => res.send());

// app.use("/api", apiRouter);

const adminRouter = require("./routers/Staff/adminRouter.router");

// Routes
adminRouter;
app.use("/api/v1/admins", adminRouter);

// Route de test
app.get("/api/test", (req, res) => {
  res.json({ message: "API fonctionne correctement" });
});

module.exports = app;
