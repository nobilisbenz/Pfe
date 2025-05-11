const pool = require("../databases/mysql.db");
const { v4: uuidv4 } = require("uuid");

class Student {
  constructor(
    name,
    email,
    phone,
    password,
    classLevels = [],
    academicYearId = null,
    programId = null,
    prefectName = "",
  ) {
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._password = password;
    this._classLevels = classLevels;
    this._academicYearId = academicYearId;
    this._programId = programId;
    this._prefectName = prefectName;
    this._studentId = this._generateStudentId();
    this._role = "student";
    this._currentClassLevel =
      classLevels.length > 0 ? classLevels[classLevels.length - 1] : null;
    this._dateAdmitted = new Date();
    this._isPromotedToLevel200 = false;
    this._isPromotedToLevel300 = false;
    this._isPromotedToLevel400 = false;
    this._isGraduated = false;
    this._isWithdrawn = false;
    this._isSuspended = false;
    this._yearGraduated = null;
  }

  _generateStudentId() {
    return (
      "STU" +
      Math.floor(100 + Math.random() * 900) +
      Date.now().toString().slice(2, 4) +
      this._name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    );
  }

  // Getters and setters
  get name() {
    return this._name;
  }

  set name(name) {
    if (!name) throw new Error("Invalid name value.");
    name = name.trim();
    if (name === "") throw new Error("Invalid name value.");
    this._name = name;
    // Update studentId when name changes
    this._studentId = this._generateStudentId();
  }

  get email() {
    return this._email;
  }

  set email(email) {
    if (!email) throw new Error("Invalid email value.");
    email = email.trim();
    if (email === "") throw new Error("Invalid email value.");
    this._email = email;
  }

  get phone() {
    return this._phone;
  }

  set phone(phone) {
    if (!phone) throw new Error("Invalid phone value.");
    phone = phone.trim();
    if (phone === "") throw new Error("Invalid phone value.");
    this._phone = phone;
  }

  get password() {
    return this._password;
  }

  set password(password) {
    if (!password) throw new Error("Invalid password value.");
    this._password = password;
  }

  get studentId() {
    return this._studentId;
  }

  get role() {
    return this._role;
  }

  get classLevels() {
    return this._classLevels;
  }

  set classLevels(classLevels) {
    this._classLevels = classLevels;
    this._currentClassLevel =
      classLevels.length > 0 ? classLevels[classLevels.length - 1] : null;
  }

  get currentClassLevel() {
    return this._currentClassLevel;
  }

  // Database operations
  async save() {
    const sql = `INSERT INTO students (
      id, 
      name, 
      email, 
      phone, 
      password, 
      student_id, 
      role, 
      current_class_level, 
      academic_year_id, 
      date_admitted, 
      program_id, 
      is_promoted_to_level200, 
      is_promoted_to_level300, 
      is_promoted_to_level400, 
      is_graduated, 
      is_withdrawn, 
      is_suspended, 
      prefect_name, 
      year_graduated, 
      created_at, 
      updated_at
    ) VALUES (
      UUID(), 
      "${this.name}", 
      "${this.email}", 
      "${this.phone}", 
      "${this.password}", 
      "${this._studentId}", 
      "${this._role}", 
      "${this._currentClassLevel}", 
      ${this._academicYearId ? `"${this._academicYearId}"` : "NULL"}, 
      "${this._dateAdmitted.toISOString().slice(0, 19).replace("T", " ")}", 
      ${this._programId ? `"${this._programId}"` : "NULL"}, 
      ${this._isPromotedToLevel200}, 
      ${this._isPromotedToLevel300}, 
      ${this._isPromotedToLevel400}, 
      ${this._isGraduated}, 
      ${this._isWithdrawn}, 
      ${this._isSuspended}, 
      ${this._prefectName ? `"${this._prefectName}"` : "NULL"}, 
      ${this._yearGraduated ? `"${this._yearGraduated.toISOString().slice(0, 19).replace("T", " ")}"` : "NULL"},
      NOW(),
      NOW()
    )`;

    await pool.execute(sql);

    // Insert class levels
    if (this._classLevels.length > 0) {
      for (const level of this._classLevels) {
        await pool.execute(`
          INSERT INTO student_class_levels (id, student_id, class_level)
          VALUES (UUID(), (SELECT id FROM students WHERE student_id = "${this._studentId}"), "${level}")
        `);
      }
    }
  }

  static async find() {
    const sql = "SELECT * FROM students";
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM students WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    // Get class levels
    const [classLevels] = await pool.execute(`
      SELECT class_level FROM student_class_levels WHERE student_id = "${id}" ORDER BY created_at ASC
    `);

    // Get exam results
    const [examResults] = await pool.execute(`
      SELECT * FROM exam_results WHERE student_id = "${id}"
    `);

    if (rows.length > 0) {
      rows[0].classLevels = classLevels.map((level) => level.class_level);
      rows[0].examResults = examResults;
      return rows[0];
    }

    return null;
  }

  static async findByStudentId(studentId) {
    const sql = `SELECT * FROM students WHERE student_id = "${studentId}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows.length > 0 ? rows[0] : null;
  }

  static async findByIdAndUpdate(id, options) {
    let updateFields = [];

    if (options.name) updateFields.push(`name = "${options.name}"`);
    if (options.email) updateFields.push(`email = "${options.email}"`);
    if (options.phone) updateFields.push(`phone = "${options.phone}"`);
    if (options.password) updateFields.push(`password = "${options.password}"`);
    if (options.currentClassLevel)
      updateFields.push(`current_class_level = "${options.currentClassLevel}"`);
    if (options.academicYearId)
      updateFields.push(`academic_year_id = "${options.academicYearId}"`);
    if (options.programId)
      updateFields.push(`program_id = "${options.programId}"`);
    if (options.hasOwnProperty("isPromotedToLevel200"))
      updateFields.push(
        `is_promoted_to_level200 = ${options.isPromotedToLevel200}`,
      );
    if (options.hasOwnProperty("isPromotedToLevel300"))
      updateFields.push(
        `is_promoted_to_level300 = ${options.isPromotedToLevel300}`,
      );
    if (options.hasOwnProperty("isPromotedToLevel400"))
      updateFields.push(
        `is_promoted_to_level400 = ${options.isPromotedToLevel400}`,
      );
    if (options.hasOwnProperty("isGraduated"))
      updateFields.push(`is_graduated = ${options.isGraduated}`);
    if (options.hasOwnProperty("isWithdrawn"))
      updateFields.push(`is_withdrawn = ${options.isWithdrawn}`);
    if (options.hasOwnProperty("isSuspended"))
      updateFields.push(`is_suspended = ${options.isSuspended}`);
    if (options.prefectName)
      updateFields.push(`prefect_name = "${options.prefectName}"`);
    if (options.yearGraduated)
      updateFields.push(
        `year_graduated = "${options.yearGraduated.toISOString().slice(0, 19).replace("T", " ")}"`,
      );

    updateFields.push("updated_at = NOW()");

    if (updateFields.length === 0) return;

    const sql = `UPDATE students SET ${updateFields.join(", ")} WHERE id = "${id}"`;
    await pool.execute(sql);

    // Update class levels if provided
    if (options.classLevels && Array.isArray(options.classLevels)) {
      // Delete existing class levels
      await pool.execute(
        `DELETE FROM student_class_levels WHERE student_id = "${id}"`,
      );

      // Insert new class levels
      for (const level of options.classLevels) {
        await pool.execute(`
          INSERT INTO student_class_levels (id, student_id, class_level)
          VALUES (UUID(), "${id}", "${level}")
        `);
      }
    }
  }

  static async findByIdAndDelete(id) {
    // Delete related records first
    await pool.execute(
      `DELETE FROM student_class_levels WHERE student_id = "${id}"`,
    );
    await pool.execute(`DELETE FROM exam_results WHERE student_id = "${id}"`);

    // Delete the student
    const sql = `DELETE FROM students WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async addExamResult(studentId, examResultId) {
    const sql = `
      INSERT INTO student_exam_results (id, student_id, exam_result_id)
      VALUES (UUID(), "${studentId}", "${examResultId}")
    `;
    await pool.execute(sql);
  }
}

module.exports = Student;
