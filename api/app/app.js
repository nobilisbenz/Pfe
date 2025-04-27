const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const {
  globalErrHandler,
  notFoundErr,
} = require("../middlewares/globalErrHandler");
const adminRouter = require("../routes/staff/adminRouter.js");

const app = express();

//Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/v1/admins", adminRouter);


// Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

//Error middlewares
app.use(notFoundErr);
app.use(globalErrHandler);

module.exports = app;
