const pool = require("../databases/mysql.db");
const { v4: uuidv4 } = require("uuid");

class Program {
  constructor(
    name,
    description,
    duration,
    academicYearId,
    classLevelId,
    schedule,
    createdById,
    status = "Planifié",
  ) {
    this._name = name;
    this._description = description;
    this._duration = duration;
    this._code = this._generateCode(name);
    this._academicYearId = academicYearId;
    this._classLevelId = classLevelId;
    this._schedule = schedule;
    this._createdById = createdById;
    this._status = status;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._teachers = [];
    this._students = [];
    this._subjects = [];
    this._courses = [];
  }

  _generateCode(name) {
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    const randomNum1 = Math.floor(10 + Math.random() * 90);
    const randomNum2 = Math.floor(10 + Math.random() * 90);
    return `${initials}${randomNum1}${randomNum2}`;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    if (!name) throw new Error("Invalid name value.");
    name = name.trim();
    if (name === "") throw new Error("Invalid name value.");
    this._name = name;
    this._code = this._generateCode(name);
  }

  get description() {
    return this._description;
  }

  set description(description) {
    if (!description) throw new Error("Invalid description value.");
    description = description.trim();
    if (description === "") throw new Error("Invalid description value.");
    this._description = description;
  }

  get duration() {
    return this._duration;
  }

  set duration(duration) {
    if (!duration) throw new Error("Invalid duration value.");
    this._duration = duration;
  }

  get code() {
    return this._code;
  }

  get academicYearId() {
    return this._academicYearId;
  }

  set academicYearId(academicYearId) {
    if (!academicYearId) throw new Error("Academic year ID is required.");
    this._academicYearId = academicYearId;
  }

  get classLevelId() {
    return this._classLevelId;
  }

  set classLevelId(classLevelId) {
    if (!classLevelId) throw new Error("Class level ID is required.");
    this._classLevelId = classLevelId;
  }

  get schedule() {
    return this._schedule;
  }

  set schedule(schedule) {
    if (
      !schedule ||
      !schedule.weekSchedule ||
      !schedule.startDate ||
      !schedule.endDate
    ) {
      throw new Error("Invalid schedule structure.");
    }
    this._schedule = schedule;
  }

  get createdById() {
    return this._createdById;
  }

  set createdById(createdById) {
    if (!createdById) throw new Error("Creator ID is required.");
    this._createdById = createdById;
  }

  get status() {
    return this._status;
  }

  set status(status) {
    const validStatuses = ["En cours", "Terminé", "Planifié"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status value.");
    }
    this._status = status;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  set updatedAt(date) {
    this._updatedAt = date;
  }

  get teachers() {
    return this._teachers;
  }

  set teachers(teachers) {
    if (!Array.isArray(teachers)) throw new Error("Teachers must be an array.");
    this._teachers = teachers;
  }

  get students() {
    return this._students;
  }

  set students(students) {
    if (!Array.isArray(students)) throw new Error("Students must be an array.");
    this._students = students;
  }

  get subjects() {
    return this._subjects;
  }

  set subjects(subjects) {
    if (!Array.isArray(subjects)) throw new Error("Subjects must be an array.");
    this._subjects = subjects;
  }

  get courses() {
    return this._courses;
  }

  set courses(courses) {
    if (!Array.isArray(courses)) throw new Error("Courses must be an array.");
    this._courses = courses;
  }

  checkScheduleConflicts() {
    const conflicts = [];
    const schedule = this.schedule.weekSchedule;

    for (let i = 0; i < schedule.length; i++) {
      const day = schedule[i];
      for (let j = 0; j < day.slots.length; j++) {
        const slot = day.slots[j];
        for (let k = j + 1; k < day.slots.length; k++) {
          const otherSlot = day.slots[k];
          if (
            (slot.startTime <= otherSlot.endTime &&
              slot.endTime >= otherSlot.startTime) ||
            (slot.teacher.toString() === otherSlot.teacher.toString() &&
              slot.startTime <= otherSlot.endTime &&
              slot.endTime >= otherSlot.startTime)
          ) {
            conflicts.push({
              day: day.day,
              slot1: slot,
              slot2: otherSlot,
              type: "Conflit horaire",
            });
          }
        }
      }
    }
    return conflicts;
  }

  async save() {
    // Check for schedule conflicts
    const conflicts = this.checkScheduleConflicts();
    if (conflicts.length > 0) {
      throw new Error("Conflits détectés dans l'emploi du temps");
    }

    const programId = uuidv4();

    // Save the main program data
    const programSql = `
      INSERT INTO programs (
        id, name, description, duration, code, academic_year_id, class_level_id, 
        created_by, status, created_at, updated_at
      ) VALUES (
        "${programId}", "${this.name}", "${this.description}", "${this.duration}", 
        "${this.code}", "${this.academicYearId}", "${this.classLevelId}", 
        "${this.createdById}", "${this.status}", 
        "${this.createdAt.toISOString()}", "${this.updatedAt.toISOString()}"
      )
    `;
    await pool.execute(programSql);

    // Save schedule data
    const scheduleId = uuidv4();
    const scheduleSql = `
      INSERT INTO program_schedules (
        id, program_id, start_date, end_date
      ) VALUES (
        "${scheduleId}", "${programId}", 
        "${new Date(this.schedule.startDate).toISOString()}", 
        "${new Date(this.schedule.endDate).toISOString()}"
      )
    `;
    await pool.execute(scheduleSql);

    // Save week schedule
    for (const daySchedule of this.schedule.weekSchedule) {
      const dayId = uuidv4();
      const daySql = `
        INSERT INTO schedule_days (
          id, schedule_id, day
        ) VALUES (
          "${dayId}", "${scheduleId}", "${daySchedule.day}"
        )
      `;
      await pool.execute(daySql);

      // Save slots for each day
      for (const slot of daySchedule.slots) {
        const slotSql = `
          INSERT INTO schedule_slots (
            id, day_id, start_time, end_time, subject_id, teacher_id, 
            room, type, max_students
          ) VALUES (
            "${uuidv4()}", "${dayId}", "${slot.startTime}", "${slot.endTime}", 
            "${slot.subject}", "${slot.teacher}", "${slot.room}", 
            "${slot.type || "Cours"}", ${slot.maxStudents || 30}
          )
        `;
        await pool.execute(slotSql);
      }
    }

    // Save relationships for teachers, students, subjects, courses
    await this._saveRelationships("program_teachers", programId, this.teachers);
    await this._saveRelationships("program_students", programId, this.students);
    await this._saveRelationships("program_subjects", programId, this.subjects);
    await this._saveRelationships("program_courses", programId, this.courses);

    return programId;
  }

  async _saveRelationships(tableName, programId, items) {
    for (const itemId of items) {
      const sql = `
        INSERT INTO ${tableName} (id, program_id, item_id)
        VALUES ("${uuidv4()}", "${programId}", "${itemId}")
      `;
      await pool.execute(sql);
    }
  }

  static async find() {
    const sql = "SELECT * FROM programs";
    const [rows, fields] = await pool.execute(sql);

    // For each program, load relationships
    for (const program of rows) {
      await Program._loadRelationships(program);
    }

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM programs WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    if (rows.length === 0) return null;

    const program = rows[0];
    await Program._loadRelationships(program);

    return program;
  }

  static async _loadRelationships(program) {
    // Load schedule
    const scheduleSql = `SELECT * FROM program_schedules WHERE program_id = "${program.id}"`;
    const [scheduleRows] = await pool.execute(scheduleSql);

    if (scheduleRows.length > 0) {
      const schedule = scheduleRows[0];

      // Load week schedule
      const daysSql = `
        SELECT * FROM schedule_days 
        WHERE schedule_id = "${schedule.id}"
        ORDER BY FIELD(day, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi')
      `;
      const [daysRows] = await pool.execute(daysSql);

      const weekSchedule = [];

      for (const day of daysRows) {
        const slotsSql = `SELECT * FROM schedule_slots WHERE day_id = "${day.id}"`;
        const [slotsRows] = await pool.execute(slotsSql);

        weekSchedule.push({
          day: day.day,
          slots: slotsRows,
        });
      }

      program.schedule = {
        weekSchedule,
        startDate: schedule.start_date,
        endDate: schedule.end_date,
      };
    }

    // Load teachers
    program.teachers = await Program._getRelatedItems(
      "program_teachers",
      program.id,
    );

    // Load students
    program.students = await Program._getRelatedItems(
      "program_students",
      program.id,
    );

    // Load subjects
    program.subjects = await Program._getRelatedItems(
      "program_subjects",
      program.id,
    );

    // Load courses
    program.courses = await Program._getRelatedItems(
      "program_courses",
      program.id,
    );
  }

  static async _getRelatedItems(tableName, programId) {
    const sql = `SELECT item_id FROM ${tableName} WHERE program_id = "${programId}"`;
    const [rows] = await pool.execute(sql);
    return rows.map((row) => row.item_id);
  }

  static async findByIdAndUpdate(id, options) {
    const program = await Program.findById(id);
    if (!program) throw new Error(`Program with id ${id} not found`);

    // Check if name is changed, regenerate code if needed
    let code = program.code;
    if (options.name && options.name !== program.name) {
      const initials = options.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
      const codeNumbers = program.code.replace(/[A-Z]/g, "");
      code = `${initials}${codeNumbers}`;
    }

    // Update the program
    const updatedAt = new Date().toISOString();

    // Prepare update fields
    const updateFields = [];
    if (options.name) updateFields.push(`name = "${options.name}"`);
    if (options.description)
      updateFields.push(`description = "${options.description}"`);
    if (options.duration) updateFields.push(`duration = "${options.duration}"`);
    if (options.name) updateFields.push(`code = "${code}"`);
    if (options.academicYearId)
      updateFields.push(`academic_year_id = "${options.academicYearId}"`);
    if (options.classLevelId)
      updateFields.push(`class_level_id = "${options.classLevelId}"`);
    if (options.createdById)
      updateFields.push(`created_by = "${options.createdById}"`);
    if (options.status) updateFields.push(`status = "${options.status}"`);
    updateFields.push(`updated_at = "${updatedAt}"`);

    if (updateFields.length > 0) {
      const sql = `UPDATE programs SET ${updateFields.join(", ")} WHERE id = "${id}"`;
      await pool.execute(sql);
    }

    // Update schedule if provided
    if (options.schedule) {
      // Get schedule ID
      const scheduleSql = `SELECT id FROM program_schedules WHERE program_id = "${id}"`;
      const [scheduleRows] = await pool.execute(scheduleSql);

      if (scheduleRows.length > 0) {
        const scheduleId = scheduleRows[0].id;

        // Update schedule dates
        if (options.schedule.startDate || options.schedule.endDate) {
          const scheduleUpdates = [];
          if (options.schedule.startDate) {
            scheduleUpdates.push(
              `start_date = "${new Date(options.schedule.startDate).toISOString()}"`,
            );
          }
          if (options.schedule.endDate) {
            scheduleUpdates.push(
              `end_date = "${new Date(options.schedule.endDate).toISOString()}"`,
            );
          }

          if (scheduleUpdates.length > 0) {
            const updateScheduleSql = `
              UPDATE program_schedules 
              SET ${scheduleUpdates.join(", ")} 
              WHERE id = "${scheduleId}"
            `;
            await pool.execute(updateScheduleSql);
          }
        }

        // If week schedule is provided, delete old and insert new
        if (options.schedule.weekSchedule) {
          // First get all days for this schedule
          const daysSql = `SELECT id FROM schedule_days WHERE schedule_id = "${scheduleId}"`;
          const [daysRows] = await pool.execute(daysSql);

          // Delete all slots for these days
          for (const day of daysRows) {
            await pool.execute(
              `DELETE FROM schedule_slots WHERE day_id = "${day.id}"`,
            );
          }

          // Delete all days
          await pool.execute(
            `DELETE FROM schedule_days WHERE schedule_id = "${scheduleId}"`,
          );

          // Insert new week schedule
          for (const daySchedule of options.schedule.weekSchedule) {
            const dayId = uuidv4();
            const daySql = `
              INSERT INTO schedule_days (
                id, schedule_id, day
              ) VALUES (
                "${dayId}", "${scheduleId}", "${daySchedule.day}"
              )
            `;
            await pool.execute(daySql);

            // Save slots for each day
            for (const slot of daySchedule.slots) {
              const slotSql = `
                INSERT INTO schedule_slots (
                  id, day_id, start_time, end_time, subject_id, teacher_id, 
                  room, type, max_students
                ) VALUES (
                  "${uuidv4()}", "${dayId}", "${slot.startTime}", "${slot.endTime}", 
                  "${slot.subject}", "${slot.teacher}", "${slot.room}", 
                  "${slot.type || "Cours"}", ${slot.maxStudents || 30}
                )
              `;
              await pool.execute(slotSql);
            }
          }
        }
      }
    }

    // Update relationships if provided
    if (options.teachers) {
      await pool.execute(
        `DELETE FROM program_teachers WHERE program_id = "${id}"`,
      );
      for (const teacherId of options.teachers) {
        await pool.execute(`
          INSERT INTO program_teachers (id, program_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${teacherId}")
        `);
      }
    }

    if (options.students) {
      await pool.execute(
        `DELETE FROM program_students WHERE program_id = "${id}"`,
      );
      for (const studentId of options.students) {
        await pool.execute(`
          INSERT INTO program_students (id, program_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${studentId}")
        `);
      }
    }

    if (options.subjects) {
      await pool.execute(
        `DELETE FROM program_subjects WHERE program_id = "${id}"`,
      );
      for (const subjectId of options.subjects) {
        await pool.execute(`
          INSERT INTO program_subjects (id, program_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${subjectId}")
        `);
      }
    }

    if (options.courses) {
      await pool.execute(
        `DELETE FROM program_courses WHERE program_id = "${id}"`,
      );
      for (const courseId of options.courses) {
        await pool.execute(`
          INSERT INTO program_courses (id, program_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${courseId}")
        `);
      }
    }
  }

  static async findByIdAndDelete(id) {
    // Get schedule ID
    const scheduleSql = `SELECT id FROM program_schedules WHERE program_id = "${id}"`;
    const [scheduleRows] = await pool.execute(scheduleSql);

    if (scheduleRows.length > 0) {
      const scheduleId = scheduleRows[0].id;

      // Get all days for this schedule
      const daysSql = `SELECT id FROM schedule_days WHERE schedule_id = "${scheduleId}"`;
      const [daysRows] = await pool.execute(daysSql);

      // Delete all slots for these days
      for (const day of daysRows) {
        await pool.execute(
          `DELETE FROM schedule_slots WHERE day_id = "${day.id}"`,
        );
      }

      // Delete all days
      await pool.execute(
        `DELETE FROM schedule_days WHERE schedule_id = "${scheduleId}"`,
      );

      // Delete schedule
      await pool.execute(
        `DELETE FROM program_schedules WHERE id = "${scheduleId}"`,
      );
    }

    // Delete relationships
    await pool.execute(
      `DELETE FROM program_teachers WHERE program_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM program_students WHERE program_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM program_subjects WHERE program_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM program_courses WHERE program_id = "${id}"`,
    );

    // Delete program
    await pool.execute(`DELETE FROM programs WHERE id = "${id}"`);
  }
}

module.exports = Program;
