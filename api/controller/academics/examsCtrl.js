const AysncHandler = require("express-async-handler");
const Exam = require("../../model/Academic/Exam");
const Teacher = require("../../model/Staff/Teacher");

//@desc  Create Exam
//@route POST /api/v1/exams
//@acess Private  Teachers only

exports.createExam = AysncHandler(async (req, res) => {
  const {
    name,
    description,
    subject,
    program,
    academicTerm,
    duration,
    examDate,
    examTime,
    examType,
    academicYear,
    classLevel,
  } = req.body;

  const teacherFound = await Teacher.findById(req.userAuth?._id);
  if (!teacherFound) {
    throw new Error("Teacher not found");
  }

  const examExists = await Exam.findOne({ name });
  if (examExists) {
    throw new Error("Exam already exists");
  }

  const examData = {
    name,
    description,
    subject,
    program,
    academicTerm,
    academicYear,
    classLevel,
    duration,
    examDate,
    examTime,
    examType,
    createdBy: req.userAuth?._id,
  };

  const examCreated = new Exam(examData);
  teacherFound.examsCreated.push(examCreated._id);

  await examCreated.save();
  await teacherFound.save();

  // Récupérer l'examen créé avec toutes les références peuplées
  const populatedExam = await Exam.findById(examCreated._id)
    .populate("subject")
    .populate("program")
    .populate("academicTerm")
    .populate("academicYear")
    .populate("classLevel")
    .populate("createdBy")
    .populate({
      path: "questions",
      populate: {
        path: "createdBy",
      },
    });

  res.status(201).json({
    status: "success",
    message: "Exam created successfully",
    data: populatedExam,
  });
});

//@desc  get all Exams
//@route GET /api/v1/exams
//@acess  Private

exports.getExams = AysncHandler(async (req, res) => {
  const exams = await Exam.find()
    .populate("subject")
    .populate("program")
    .populate("academicTerm")
    .populate("academicYear")
    .populate("classLevel")
    .populate("createdBy")
    .populate({
      path: "questions",
      populate: {
        path: "createdBy",
      },
    });

  res.status(200).json({
    status: "success",
    message: "Exams fetched successfully",
    data: exams,
  });
});

//@desc  get single exam
//@route GET /api/v1/exams/:id
//@acess  Private Teahers only

exports.getExam = AysncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate("subject")
    .populate("program")
    .populate("academicTerm")
    .populate("academicYear")
    .populate("classLevel")
    .populate("createdBy")
    .populate({
      path: "questions",
      populate: {
        path: "createdBy",
      },
    });

  if (!exam) {
    throw new Error("Examen non trouvé");
  }

  res.status(200).json({
    status: "success",
    message: "Exam fetched successfully",
    data: exam,
  });
});

//@desc   Update  Exam
//@route  PUT /api/v1/exams/:id
//@acess  Private  - Teacher only

exports.updatExam = AysncHandler(async (req, res) => {
  const {
    name,
    description,
    subject,
    program,
    academicTerm,
    duration,
    examDate,
    examTime,
    examType,
    createdBy,
    academicYear,
    classLevel,
  } = req.body;

  // Vérifier si un autre examen avec le même nom existe déjà (sauf l'examen en cours de modification)
  const examFound = await Exam.findOne({ name, _id: { $ne: req.params.id } });
  if (examFound) {
    throw new Error("Un autre examen avec ce nom existe déjà");
  }

  const examUpdated = await Exam.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      subject,
      program,
      academicTerm,
      duration,
      examDate,
      examTime,
      examType,
      createdBy,
      academicYear,
      classLevel,
      createdBy: req.userAuth._id,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("subject")
    .populate("program")
    .populate("academicTerm")
    .populate("academicYear")
    .populate("classLevel")
    .populate("createdBy")
    .populate({
      path: "questions",
      populate: {
        path: "createdBy",
      },
    });

  if (!examUpdated) {
    throw new Error("Examen non trouvé");
  }

  res.status(200).json({
    status: "success",
    message: "Exam updated successfully",
    data: examUpdated,
  });
});

//@desc   Delete  Exam
//@route  DELETE /api/v1/exams/:id
//@acess  Private  - Teacher only

exports.deleteExam = AysncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate("subject")
    .populate("program")
    .populate("academicTerm")
    .populate("academicYear")
    .populate("classLevel")
    .populate("createdBy")
    .populate({
      path: "questions",
      populate: {
        path: "createdBy",
      },
    });

  if (!exam) {
    throw new Error("Examen non trouvé");
  }

  await Exam.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Exam deleted successfully",
  });
});
