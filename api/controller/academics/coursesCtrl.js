const AysncHandler = require("express-async-handler");
const Course = require("../../model/Academic/Course");
const Program = require("../../model/Academic/Program");
const Admin = require("../../model/Staff/Admin");

//@desc  Create Course
//@route POST /api/v1/courses
//@acess  Private Admin only
exports.createCourse = AysncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    duration, 
    level, 
    price, 
    image, 
    program, 
    maxStudents,
    teacher 
  } = req.body;
  
  // Vérifier si le cours existe
  const courseExists = await Course.findOne({ title });
  if (courseExists) {
    throw new Error("Une formation avec ce titre existe déjà");
  }

  // Vérifier si le programme existe
  const programExists = await Program.findById(program);
  if (!programExists) {
    throw new Error("Le programme spécifié n'existe pas");
  }

  // Créer le cours
  const courseCreated = await Course.create({
    title,
    description,
    duration,
    level,
    price,
    image,
    program,
    maxStudents,
    teacher,
    createdBy: req.userAuth._id,
  });

  // Ajouter la référence du cours au programme
  programExists.courses = programExists.courses || [];
  programExists.courses.push(courseCreated._id);
  await programExists.save();

  res.status(201).json({
    status: "success",
    message: "Formation créée avec succès",
    data: courseCreated,
  });
});

//@desc  Get all Courses
//@route GET /api/v1/courses
//@acess  Public
exports.getCourses = AysncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('program', 'name')
    .populate('teacher', 'name')
    .populate('enrolledStudents', 'name');

  res.status(200).json({
    status: "success",
    message: "Formations récupérées avec succès",
    data: courses,
  });
});

//@desc  Get Courses by Program
//@route GET /api/v1/courses/program/:programId
//@acess  Public
exports.getCoursesByProgram = AysncHandler(async (req, res) => {
  const courses = await Course.find({ program: req.params.programId })
    .populate('teacher', 'name')
    .populate('enrolledStudents', 'name');

  res.status(200).json({
    status: "success",
    message: "Formations du programme récupérées avec succès",
    data: courses,
  });
});

//@desc  Get single Course
//@route GET /api/v1/courses/:id
//@acess  Public
exports.getCourse = AysncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('program', 'name')
    .populate('teacher', 'name')
    .populate('enrolledStudents', 'name');

  if (!course) {
    throw new Error("Formation non trouvée");
  }

  res.status(200).json({
    status: "success",
    message: "Formation récupérée avec succès",
    data: course,
  });
});

//@desc  Update Course
//@route PUT /api/v1/courses/:id
//@acess  Private Admin only
exports.updateCourse = AysncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    duration, 
    level, 
    price, 
    image,
    program,
    status,
    maxStudents,
    teacher 
  } = req.body;

  // Vérifier si le programme existe si fourni
  if (program) {
    const programExists = await Program.findById(program);
    if (!programExists) {
      throw new Error("Le programme spécifié n'existe pas");
    }
  }

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      duration,
      level,
      price,
      image,
      program,
      status,
      maxStudents,
      teacher
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('program', 'name');

  if (!course) {
    throw new Error("Formation non trouvée");
  }

  res.status(200).json({
    status: "success",
    message: "Formation mise à jour avec succès",
    data: course,
  });
});

//@desc  Delete Course
//@route DELETE /api/v1/courses/:id
//@acess  Private Admin only
exports.deleteCourse = AysncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    throw new Error("Formation non trouvée");
  }

  // Retirer la référence du cours du programme
  if (course.program) {
    const program = await Program.findById(course.program);
    if (program) {
      program.courses = program.courses.filter(
        courseId => courseId.toString() !== course._id.toString()
      );
      await program.save();
    }
  }

  await Course.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Formation supprimée avec succès"
  });
});