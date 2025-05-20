const AsyncHandler = require("express-async-handler");
const ClassLevel = require("../../model/Academic/ClassLevel");
const Program = require("../../model/Academic/Program");
const Subject = require("../../model/Academic/Subject");
const Admin = require("../../model/Staff/Admin");
const AcademicYear = require("../../model/Academic/AcademicYear");

//@desc  Create Program
//@route POST /api/v1/programs
//@acess  Private
exports.createProgram = AsyncHandler(async (req, res) => {
  const { name, description, duration, schedule, academicYear, classLevel } = req.body;
  
  // Validation des champs requis
  if (!name || !description || !duration) {
    return res.status(400).json({
      status: "error",
      message: "Le nom, la description et la durée sont obligatoires"
    });
  }

  try {
    //check if exists
    const programFound = await Program.findOne({ name });
    if (programFound) {
      return res.status(400).json({
        status: "error",
        message: "Programme déjà existant"
      });
    }

    // Trouver l'année académique en cours si non spécifiée
    let academicYearId = academicYear;
    if (!academicYearId) {
      const currentAcademicYear = await AcademicYear.findOne({ isCurrent: true });
      if (!currentAcademicYear) {
        return res.status(400).json({
          status: "error",
          message: "Aucune année académique en cours trouvée"
        });
      }
      academicYearId = currentAcademicYear._id;
    }

    // Trouver le premier niveau de classe si non spécifié
    let classLevelId = classLevel;
    if (!classLevelId) {
      const defaultClassLevel = await ClassLevel.findOne();
      if (!defaultClassLevel) {
        return res.status(400).json({
          status: "error",
          message: "Aucun niveau de classe trouvé"
        });
      }
      classLevelId = defaultClassLevel._id;
    }

    // Créer un emploi du temps par défaut si non spécifié
    const defaultSchedule = {
      weekSchedule: [],
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };

    // Créer le programme
    const programCreated = await Program.create({
      name,
      description,
      duration,
      schedule: schedule || defaultSchedule,
      academicYear: academicYearId,
      classLevel: classLevelId,
      createdBy: req.userAuth._id,
    });

    // Vérifier si l'administrateur existe
    const admin = await Admin.findById(req.userAuth._id);
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Administrateur non trouvé"
      });
    }

    // Ajouter le programme à l'admin
    admin.programs = admin.programs || [];
    admin.programs.push(programCreated._id);
    await admin.save();

    res.status(201).json({
      status: "success",
      message: "Programme créé avec succès",
      data: programCreated,
    });
  } catch (error) {
    console.error("Erreur lors de la création du programme:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Erreur lors de la création du programme"
    });
  }
});

//@desc  get all Programs
//@route GET /api/v1/programs
//@acess  Private
exports.getPrograms = AsyncHandler(async (req, res) => {
  const programs = await Program.find().populate('subjects').populate('teachers');
  res.status(200).json({
    status: "success",
    message: "Programmes récupérés avec succès",
    data: programs,
  });
});

//@desc  get single Program
//@route GET /api/v1/programs/:id
//@acess  Private
exports.getProgram = AsyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id)
    .populate('subjects')
    .populate('teachers');
  
  if (!program) {
    throw new Error("Programme non trouvé");
  }

  res.status(200).json({
    status: "success",
    message: "Programme récupéré avec succès",
    data: program,
  });
});

//@desc   Update Program
//@route  PUT /api/v1/programs/:id
//@acess  Private
exports.updateProgram = AsyncHandler(async (req, res) => {
  const { name, description, duration, schedule } = req.body;
  
  const program = await Program.findById(req.params.id);
  if (!program) {
    throw new Error("Programme non trouvé");
  }

  // Mettre à jour les champs de base
  program.name = name || program.name;
  program.description = description || program.description;
  program.duration = duration || program.duration;

  // Mettre à jour l'emploi du temps si fourni
  if (schedule) {
    program.schedule = schedule;
  }

  await program.save();

  res.status(200).json({
    status: "success",
    message: "Programme mis à jour avec succès",
    data: program,
  });
});

//@desc   Update Program Schedule
//@route  PUT /api/v1/programs/:id/schedule
//@acess  Private
exports.updateProgramSchedule = AsyncHandler(async (req, res) => {
  const { weekSchedule } = req.body;
  
  const program = await Program.findById(req.params.id);
  if (!program) {
    throw new Error("Programme non trouvé");
  }

  // Valider la structure de l'emploi du temps
  if (!weekSchedule || !Array.isArray(weekSchedule)) {
    throw new Error("Format d'emploi du temps invalide");
  }

  // Mettre à jour l'emploi du temps
  program.schedule = {
    ...program.schedule,
    weekSchedule
  };

  await program.save();

  res.status(200).json({
    status: "success",
    message: "Emploi du temps mis à jour avec succès",
    data: program,
  });
});

//@desc   Delete Program
//@route  DELETE /api/v1/programs/:id
//@acess  Private
exports.deleteProgram = AsyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) {
    throw new Error("Programme non trouvé");
  }

  await Program.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    status: "success",
    message: "Programme supprimé avec succès",
  });
});

//@desc   Add subject to Program
//@route  PUT /api/v1/programs/:id/subjects
//@acess  Private
exports.addSubjectToProgram = AsyncHandler(async (req, res) => {
  const { subjectId } = req.body;
  
  const program = await Program.findById(req.params.id);
  if (!program) {
    throw new Error("Programme non trouvé");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new Error("Matière non trouvée");
  }

  // Vérifier si la matière existe déjà dans le programme
  if (program.subjects.includes(subjectId)) {
    throw new Error("Cette matière est déjà dans le programme");
  }

  program.subjects.push(subjectId);
  await program.save();

  res.status(200).json({
    status: "success",
    message: "Matière ajoutée avec succès",
    data: program,
  });
});
