const AysncHandler = require("express-async-handler");
const Schedule = require("../../model/Academic/Schedule");

//@desc  Create Schedule
//@route POST /api/v1/schedules
//@acess Private Admin only
exports.createSchedule = AysncHandler(async (req, res) => {
  const { program, weekNumber, year, slots, classLevel, academicYear } = req.body;

  // Vérifier si un emploi du temps existe déjà pour cette combinaison
  const existingSchedule = await Schedule.findOne({
    program,
    weekNumber,
    year,
  });

  if (existingSchedule) {
    throw new Error("Un emploi du temps existe déjà pour cette semaine");
  }

  const schedule = await Schedule.create({
    program,
    weekNumber,
    year,
    slots,
    classLevel,
    academicYear,
    createdBy: req.userAuth._id,
  });

  res.status(201).json({
    status: "success",
    message: "Emploi du temps créé avec succès",
    data: schedule,
  });
});

//@desc  Get all Schedules
//@route GET /api/v1/schedules
//@acess Private
exports.getSchedules = AysncHandler(async (req, res) => {
  const { program, weekNumber, year, classLevel } = req.query;
  
  let query = {};
  
  if (program) query.program = program;
  if (weekNumber) query.weekNumber = weekNumber;
  if (year) query.year = year;
  if (classLevel) query.classLevel = classLevel;

  const schedules = await Schedule.find(query)
    .populate("program", "name")
    .populate("classLevel", "name")
    .populate("academicYear", "name")
    .populate("slots.subject", "name")
    .populate("slots.teacher", "name");

  res.status(200).json({
    status: "success",
    message: "Emplois du temps récupérés avec succès",
    data: schedules,
  });
});

//@desc  Get Schedule by ID
//@route GET /api/v1/schedules/:id
//@acess Private
exports.getSchedule = AysncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate("program", "name")
    .populate("classLevel", "name")
    .populate("academicYear", "name")
    .populate("slots.subject", "name")
    .populate("slots.teacher", "name");

  if (!schedule) {
    throw new Error("Emploi du temps non trouvé");
  }

  res.status(200).json({
    status: "success",
    message: "Emploi du temps récupéré avec succès",
    data: schedule,
  });
});

//@desc  Update Schedule
//@route PUT /api/v1/schedules/:id
//@acess Private Admin only
exports.updateSchedule = AysncHandler(async (req, res) => {
  const { slots } = req.body;
  
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    {
      slots,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("program", "name")
    .populate("classLevel", "name")
    .populate("academicYear", "name")
    .populate("slots.subject", "name")
    .populate("slots.teacher", "name");

  if (!schedule) {
    throw new Error("Emploi du temps non trouvé");
  }

  res.status(200).json({
    status: "success",
    message: "Emploi du temps mis à jour avec succès",
    data: schedule,
  });
});

//@desc  Delete Schedule
//@route DELETE /api/v1/schedules/:id
//@acess Private Admin only
exports.deleteSchedule = AysncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    throw new Error("Emploi du temps non trouvé");
  }

  await Schedule.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Emploi du temps supprimé avec succès",
  });
});