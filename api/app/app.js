const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const {
  globalErrHandler,
  notFoundErr,
} = require("../middlewares/globalErrHandler");
const adminRouter = require("../routes/staff/adminRouter");
const academicYearRouter = require("../routes/academics/academicYear");
const academicTermRouter = require("../routes/academics/academicTerm");
const classLevelRouter = require("../routes/academics/classLevel");
const programRouter = require("../routes/academics/program");
const subjectRouter = require("../routes/academics/subjects");
const yearGroupRouter = require("../routes/academics/yearGroups");
const teachersRouter = require("../routes/staff/teachers");
const examRouter = require("../routes/academics/examRoutes");
const studentRouter = require("../routes/staff/student");
const questionsRouter = require("../routes/academics/questionRoutes");
const examResultRouter = require("../routes/academics/examRsultsRoute");
const smsRouter = require("../routes/notification/smsRoutes");
const courseRouter = require("../routes/academics/courseRoutes");
const statsRouter = require("../routes/academics/statsRoutes");
const newsRouter = require("../routes/public/newsRoutes");
const faqRouter = require("../routes/public/faqRoutes");///

const app = express();

//Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/academic-years", academicYearRouter);
app.use("/api/v1/academic-terms", academicTermRouter);
app.use("/api/v1/class-levels", classLevelRouter);
app.use("/api/v1/programs", programRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/year-groups", yearGroupRouter);
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/questions", questionsRouter);
app.use("/api/v1/exam-results", examResultRouter);
app.use("/api/v1/notifications/sms", smsRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/faqs", faqRouter);

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

//Error middlewares
app.use(notFoundErr);
app.use(globalErrHandler);

module.exports = app;
