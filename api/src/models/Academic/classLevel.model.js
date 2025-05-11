const pool = require("../databases/mysql.db");

class ClassLevel {
  constructor(
    name,
    description,
    createdBy,
    students = [],
    subjects = [],
    teachers = [],
  ) {
    this._name = name;
    this._description = description;
    this._createdBy = createdBy;
    this._students = students;
    this._subjects = subjects;
    this._teachers = teachers;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    if (!name) throw new Error("Invalid name value.");

    name = name.trim();
    if (name === "") throw new Error("Invalid name value.");

    this._name = name;
  }

  get description() {
    return this._description;
  }

  set description(description) {
    this._description = description;
  }

  get createdBy() {
    return this._createdBy;
  }

  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Invalid createdBy value.");
    this._createdBy = createdBy;
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

  get teachers() {
    return this._teachers;
  }

  set teachers(teachers) {
    if (!Array.isArray(teachers)) throw new Error("Teachers must be an array.");
    this._teachers = teachers;
  }

  async save() {
    const sql = `INSERT INTO class_levels (id, name, description, created_by, created_at, updated_at) 
                VALUES (UUID(), "${this.name}", "${this.description || ""}", "${this.createdBy}", NOW(), NOW())`;
    await pool.execute(sql);

    // Handle relationship tables for students, subjects, and teachers
    if (this.students.length > 0) {
      for (const studentId of this.students) {
        await pool.execute(`INSERT INTO class_level_students (class_level_id, student_id) 
                           VALUES ((SELECT id FROM class_levels WHERE name = "${this.name}" ORDER BY created_at DESC LIMIT 1), "${studentId}")`);
      }
    }

    if (this.subjects.length > 0) {
      for (const subjectId of this.subjects) {
        await pool.execute(`INSERT INTO class_level_subjects (class_level_id, subject_id) 
                           VALUES ((SELECT id FROM class_levels WHERE name = "${this.name}" ORDER BY created_at DESC LIMIT 1), "${subjectId}")`);
      }
    }

    if (this.teachers.length > 0) {
      for (const teacherId of this.teachers) {
        await pool.execute(`INSERT INTO class_level_teachers (class_level_id, teacher_id) 
                           VALUES ((SELECT id FROM class_levels WHERE name = "${this.name}" ORDER BY created_at DESC LIMIT 1), "${teacherId}")`);
      }
    }
  }

  static async find() {
    const sql = "SELECT * FROM class_levels";
    const [rows, fields] = await pool.execute(sql);

    // For each class level, get the related students, subjects, and teachers
    for (const row of rows) {
      const [students] = await pool.execute(
        `SELECT student_id FROM class_level_students WHERE class_level_id = "${row.id}"`,
      );
      const [subjects] = await pool.execute(
        `SELECT subject_id FROM class_level_subjects WHERE class_level_id = "${row.id}"`,
      );
      const [teachers] = await pool.execute(
        `SELECT teacher_id FROM class_level_teachers WHERE class_level_id = "${row.id}"`,
      );

      row.students = students.map((s) => s.student_id);
      row.subjects = subjects.map((s) => s.subject_id);
      row.teachers = teachers.map((t) => t.teacher_id);
    }

    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    const sql = `UPDATE class_levels SET 
                 name = "${options.name || ""}", 
                 description = "${options.description || ""}", 
                 created_by = "${options.createdBy || ""}", 
                 updated_at = NOW() 
                 WHERE id = "${id}"`;
    await pool.execute(sql);

    // Update relationships if provided
    if (options.students) {
      await pool.execute(
        `DELETE FROM class_level_students WHERE class_level_id = "${id}"`,
      );
      for (const studentId of options.students) {
        await pool.execute(
          `INSERT INTO class_level_students (class_level_id, student_id) VALUES ("${id}", "${studentId}")`,
        );
      }
    }

    if (options.subjects) {
      await pool.execute(
        `DELETE FROM class_level_subjects WHERE class_level_id = "${id}"`,
      );
      for (const subjectId of options.subjects) {
        await pool.execute(
          `INSERT INTO class_level_subjects (class_level_id, subject_id) VALUES ("${id}", "${subjectId}")`,
        );
      }
    }

    if (options.teachers) {
      await pool.execute(
        `DELETE FROM class_level_teachers WHERE class_level_id = "${id}"`,
      );
      for (const teacherId of options.teachers) {
        await pool.execute(
          `INSERT INTO class_level_teachers (class_level_id, teacher_id) VALUES ("${id}", "${teacherId}")`,
        );
      }
    }
  }

  static async findByIdAndDelete(id) {
    // Delete related records in junction tables first
    await pool.execute(
      `DELETE FROM class_level_students WHERE class_level_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM class_level_subjects WHERE class_level_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM class_level_teachers WHERE class_level_id = "${id}"`,
    );

    // Then delete the class level
    const sql = `DELETE FROM class_levels WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = ClassLevel;
