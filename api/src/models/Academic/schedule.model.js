const pool = require("../databases/mysql.db");

class Schedule {
  constructor(
    program,
    weekNumber,
    year,
    slots = [],
    classLevel,
    academicYear,
    createdBy,
  ) {
    this._program = program;
    this._weekNumber = weekNumber;
    this._year = year;
    this._slots = slots;
    this._classLevel = classLevel;
    this._academicYear = academicYear;
    this._createdBy = createdBy;
  }

  // Getters and setters
  get program() {
    return this._program;
  }
  set program(program) {
    if (!program) throw new Error("Program is required.");
    this._program = program;
  }

  get weekNumber() {
    return this._weekNumber;
  }
  set weekNumber(weekNumber) {
    if (weekNumber < 1 || weekNumber > 53)
      throw new Error("Invalid week number.");
    this._weekNumber = weekNumber;
  }

  get year() {
    return this._year;
  }
  set year(year) {
    if (year < 2000 || year > 2100) throw new Error("Invalid year value.");
    this._year = year;
  }

  get slots() {
    return this._slots;
  }
  set slots(slots) {
    if (!Array.isArray(slots)) throw new Error("Slots must be an array.");

    // Validate each slot
    for (const slot of slots) {
      const validDays = [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ];
      if (!validDays.includes(slot.day)) {
        throw new Error("Invalid day value in slot.");
      }

      if (!slot.timeSlot || !slot.timeSlot.start || !slot.timeSlot.end) {
        throw new Error("Invalid time slot in slot.");
      }

      if (!slot.subject) {
        throw new Error("Subject is required in slot.");
      }

      if (!slot.teacher) {
        throw new Error("Teacher is required in slot.");
      }

      if (!slot.room) {
        throw new Error("Room is required in slot.");
      }
    }

    this._slots = slots;
  }

  get classLevel() {
    return this._classLevel;
  }
  set classLevel(classLevel) {
    if (!classLevel) throw new Error("Class level is required.");
    this._classLevel = classLevel;
  }

  get academicYear() {
    return this._academicYear;
  }
  set academicYear(academicYear) {
    if (!academicYear) throw new Error("Academic year is required.");
    this._academicYear = academicYear;
  }

  get createdBy() {
    return this._createdBy;
  }
  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Creator is required.");
    this._createdBy = createdBy;
  }

  async save() {
    // First check if a schedule with the same program, weekNumber, and year already exists
    const checkSql = `SELECT * FROM schedules WHERE program = "${this.program}" AND weekNumber = ${this.weekNumber} AND year = ${this.year}`;
    const [existingSchedules] = await pool.execute(checkSql);

    if (existingSchedules.length > 0) {
      throw new Error(
        "A schedule with this program, week number, and year already exists.",
      );
    }

    // Insert the schedule
    const slotsJSON = JSON.stringify(this.slots);
    const sql = `INSERT INTO schedules (
      id, program, weekNumber, year, slots, classLevel, 
      academicYear, createdBy, createdAt, updatedAt
    ) VALUES (
      UUID(), "${this.program}", ${this.weekNumber}, ${this.year}, 
      '${slotsJSON}', "${this.classLevel}", "${this.academicYear}", 
      "${this.createdBy}", NOW(), NOW()
    )`;

    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM schedules";
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    const slotsJSON = options.slots ? JSON.stringify(options.slots) : null;

    let updateFields = [];
    if (options.program) updateFields.push(`program = "${options.program}"`);
    if (options.weekNumber !== undefined)
      updateFields.push(`weekNumber = ${options.weekNumber}`);
    if (options.year !== undefined) updateFields.push(`year = ${options.year}`);
    if (slotsJSON) updateFields.push(`slots = '${slotsJSON}'`);
    if (options.classLevel)
      updateFields.push(`classLevel = "${options.classLevel}"`);
    if (options.academicYear)
      updateFields.push(`academicYear = "${options.academicYear}"`);
    if (options.createdBy)
      updateFields.push(`createdBy = "${options.createdBy}"`);
    updateFields.push(`updatedAt = NOW()`);

    // If updating program, weekNumber, or year, check for uniqueness constraint
    if (
      options.program ||
      options.weekNumber !== undefined ||
      options.year !== undefined
    ) {
      // Get the current schedule
      const getSql = `SELECT * FROM schedules WHERE id = "${id}"`;
      const [currentSchedules] = await pool.execute(getSql);

      if (currentSchedules.length === 0) {
        throw new Error("Schedule not found.");
      }

      const currentSchedule = currentSchedules[0];

      // Build the values for the uniqueness check
      const program = options.program || currentSchedule.program;
      const weekNumber =
        options.weekNumber !== undefined
          ? options.weekNumber
          : currentSchedule.weekNumber;
      const year =
        options.year !== undefined ? options.year : currentSchedule.year;

      // Check if a different schedule with these values exists
      const checkSql = `SELECT * FROM schedules WHERE program = "${program}" AND weekNumber = ${weekNumber} AND year = ${year} AND id != "${id}"`;
      const [existingSchedules] = await pool.execute(checkSql);

      if (existingSchedules.length > 0) {
        throw new Error(
          "A schedule with this program, week number, and year already exists.",
        );
      }
    }

    const sql = `UPDATE schedules SET ${updateFields.join(", ")} WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM schedules WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Schedule;
