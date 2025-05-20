// js
const AysncHandler = require("express-async-handler");
const Admin = require("../../model/Staff/Admin");
const Teacher = require("../../model/Staff/Teacher");
const Student = require("../../model/Academic/Student");
const Exam = require("../../model/Academic/Exam");
const generateToken = require("../../utils/generateToken");
const { hashPassword, isPassMatched } = require("../../utils/helpers");

//@desc Register admin
//@route POST /api/admins/register
//@acess  Private
exports.registerAdmCtrl = AysncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  //Check if email exists
  const adminFound = await Admin.findOne({ email });
  if (adminFound) {
    throw new Error("Admin Exists");
  }

  //register
  const user = await Admin.create({
    name,
    email,
    phone,
    password: await hashPassword(password),
  });
  res.status(201).json({
    status: "success",
    data: user,
    message: "Admin registered successfully",
  });
});

//@desc     login admins
//@route    POST /api/v1/admins/login
//@access   Private
exports.loginAdminCtrl = AysncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'email et le mot de passe sont fournis
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email et mot de passe requis",
    });
  }

  // Rechercher l'admin
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({
      status: "error",
      message: "Identifiants invalides",
    });
  }

  // Vérifier le mot de passe
  const isMatched = await isPassMatched(password, admin.password);
  if (!isMatched) {
    return res.status(401).json({
      status: "error",
      message: "Identifiants invalides",
    });
  }

  // Générer le token avec les informations importantes
  const token = generateToken({
    id: admin._id,
    role: "admin",
    name: admin.name,
  });

  // Renvoyer la réponse
  res.status(200).json({
    status: "success",
    data: token,
    message: "Connexion réussie",
  });
});

//@desc     Get all admins
//@route    GET /api/v1/admins
//@access   Private
exports.getAdminsCtrl = AysncHandler(async (req, res) => {
  const admins = await Admin.find();
  res.status(200).json({
    status: "success",
    data: admins,
    message: "Admins fetched successfully",
  });
});

//@desc     Get single admin
//@route    GET /api/v1/admins/:id
//@access   Private
exports.getAdminProfileCtrl = AysncHandler(async (req, res) => {
  const admin = await Admin.findById(req.userAuth._id)
    .select("-password -createdAt -updatedAt")
    .populate("academicYears")
    .populate("academicTerms")
    .populate("programs")
    .populate("yearGroups")
    .populate("classLevels")
    .populate("teachers")
    .populate("students");
  if (!admin) {
    throw new Error("Admin Not Found");
  } else {
    res.status(200).json({
      status: "success",
      data: admin,
      message: "Admin Profile fetched successfully",
    });
  }
});

//@desc    update admin
//@route    UPDATE /api/v1/admins/:id
//@access   Private
exports.updateAdminCtrl = AysncHandler(async (req, res) => {
  const { email, name, password, phone } = req.body;
  //if email is taken
  const emailExist = await Admin.findOne({ email });
  if (emailExist) {
    throw new Error("This email is taken/exist");
  }

  //check if user is updating password
  if (password) {
    //update with password
    const admin = await Admin.findByIdAndUpdate(
      req.userAuth._id,
      {
        email,
        password: await hashPassword(password),
        name,
        phone,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: "success",
      data: admin,
      message: "Admin updated successfully",
    });
  } else {
    //update without password
    const admin = await Admin.findByIdAndUpdate(
      req.userAuth._id,
      {
        email,
        name,
        phone,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: "success",
      data: admin,
      message: "Admin updated successfully",
    });
  }
});

//@desc     Delete admin
//@route    DELETE /api/v1/admins/:id
//@access   Private
exports.deleteAdminCtrl = AysncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    data: admin,
    message: "Admin deleted successfully",
  });
});

//@desc     admin suspends a teacher
//@route    PUT /api/v1/admins/suspend/teacher/:id
//@access   Private
exports.adminSuspendTeacherCtrl = AysncHandler(async (req, res) => {
  //check if teacher is suspended
  const checkTeacher = await Teacher.findById(req.params.id);
  if (checkTeacher.isSuspended) {
    return res.status(400).json({
      status: "fail",
      message: "Teacher is already suspended",
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      isSuspended: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: teacher,
    message: "Teacher suspended successfully",
  });
});

//@desc     admin unsuspends a teacher
//@route    PUT /api/v1/admins/unsuspend/teacher/:id
//@access   Private
exports.adminUnSuspendTeacherCtrl = AysncHandler(async (req, res) => {
  //check if teacher is suspended
  const checkTeacher = await Teacher.findById(req.params.id);
  if (!checkTeacher.isSuspended) {
    return res.status(400).json({
      status: "fail",
      message: "Teacher is already unsuspended",
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      isSuspended: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: teacher,
    message: "Teacher unsuspended successfully",
  });
});

//@desc     admin withdraws a teacher
//@route    PUT /api/v1/admins/withdraw/teacher/:id
//@access   Private
exports.adminWithdrawTeacherCtrl = AysncHandler(async (req, res) => {
  //check if teacher is withdrawn
  const checkTeacher = await Teacher.findById(req.params.id);
  if (checkTeacher.isWitdrawn) {
    return res.status(400).json({
      status: "fail",
      message: "Teacher is already withdrawn",
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      isWitdrawn: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    data: teacher,
    message: "Teacher withdrawn successfully",
  });
});

//@desc     admin Unwithdraws a teacher
//@route    PUT /api/v1/admins/withdraw/teacher/:id
//@access   Private
exports.adminUnWithdrawTeacherCtrl = AysncHandler(async (req, res) => {
  //check if teacher is withdrawn
  const checkTeacher = await Teacher.findById(req.params.id);
  if (!checkTeacher.isWitdrawn) {
    return res.status(400).json({
      status: "fail",
      message: "Teacher is already unwithdrawn",
    });
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      isWitdrawn: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    data: teacher,
    message: "Teacher unwithdrawn successfully",
  });
});

//@desc     admin publich exam result
//@route    PUT /api/v1/admins/publish/exam/:id
//@access   Private
exports.adminPublishResultsCtrl = AysncHandler(async (req, res) => {
  //check if exam is published
  const checkExam = await Exam.findById(req.params.id);
  if (checkExam.isPublished) {
    return res.status(400).json({
      status: "fail",
      message: "Exam is already published",
    });
  }

  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    {
      isPublished: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: exam,
    message: "Exam published successfully",
  });
});

//@desc     admin unpublish exam result
//@route    PUT /api/v1/admins/unpublish/exam/:id
//@access   Private
exports.adminUnPublishResultsCtrl = AysncHandler(async (req, res) => {
  //check if exam is published
  const checkExam = await Exam.findById(req.params.id);
  if (!checkExam.isPublished) {
    return res.status(400).json({
      status: "fail",
      message: "Exam is already unpublished",
    });
  }

  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    {
      isPublished: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: exam,
    message: "Exam unpublished successfully",
  });
});

//@desc     Get all users
//@route    GET /api/v1/admins/users
//@access   Private
exports.getAllUsersCtrl = AysncHandler(async (req, res) => {
  try {
    // Récupérer tous les étudiants avec les champs nécessaires
    const students = await Student.find().select(
      "name email phone studentId role isWithdrawn isSuspended",
    );

    // Récupérer tous les enseignants avec les champs nécessaires
    const teachers = await Teacher.find()
      .select("name email phone teacherId role isWitdrawn isSuspended")
      .populate("subject");

    // Combiner les résultats
    const users = [
      ...students.map((student) => ({
        ...student.toObject(),
        id: student._id,
        userType: "student",
      })),
      ...teachers.map((teacher) => ({
        ...teacher.toObject(),
        id: teacher._id,
        userType: "teacher",
      })),
    ];

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message:
        "Erreur lors de la récupération des utilisateurs: " + error.message,
    });
  }
});
