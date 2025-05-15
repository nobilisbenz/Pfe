const pool = require("../databases/mysql.db");

class Subject {
  constructor(
    name,
    description,
    academicTermId,
    createdById,
    teacherId = null,
    duration = "3 months",
  ) {
    this._name = name;
    this._description = description;
    this._teacherId = teacherId;
    this._academicTermId = academicTermId;
    this._createdById = createdById;
    this._duration = duration;
    this._createdAt = new Date();
    this._updatedAt = new Date();
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
    if (!description) throw new Error("Invalid description value.");
    description = description.trim();
    if (description === "") throw new Error("Invalid description value.");
    this._description = description;
  }

  get teacherId() {
    return this._teacherId;
  }

  set teacherId(teacherId) {
    this._teacherId = teacherId;
  }

  get academicTermId() {
    return this._academicTermId;
  }

  set academicTermId(academicTermId) {
    if (!academicTermId) throw new Error("Academic term ID is required.");
    this._academicTermId = academicTermId;
  }

  get createdById() {
    return this._createdById;
  }

  set createdById(createdById) {
    if (!createdById) throw new Error("Creator ID is required.");
    this._createdById = createdById;
  }

  get duration() {
    return this._duration;
  }

  set duration(duration) {
    if (!duration) throw new Error("Invalid duration value.");
    this._duration = duration;
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

  async save() {
    const sql = `INSERT INTO subjects (
      id, 
      name, 
      description, 
      teacher_id, 
      academic_term_id, 
      created_by, 
      duration, 
      created_at, 
      updated_at
    ) VALUES (
      UUID(), 
      "${this.name}", 
      "${this.description}", 
      ${this.teacherId ? `"${this.teacherId}"` : "NULL"}, 
      "${this.academicTermId}", 
      "${this.createdById}", 
      "${this.duration}", 
      "${this.createdAt.toISOString()}", 
      "${this.updatedAt.toISOString()}"
    )`;

    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM subjects";
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM subjects WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0] || null;
  }

  static async findByAcademicTerm(academicTermId) {
    const sql = `SELECT * FROM subjects WHERE academic_term_id = "${academicTermId}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findByTeacher(teacherId) {
    const sql = `SELECT * FROM subjects WHERE teacher_id = "${teacherId}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    // Set the updated timestamp
    options.updatedAt = new Date().toISOString();

    // Prepare update fields
    const updateFields = [];

    if (options.name) updateFields.push(`name = "${options.name}"`);
    if (options.description)
      updateFields.push(`description = "${options.description}"`);
    if (options.teacherId !== undefined) {
      updateFields.push(
        `teacher_id = ${options.teacherId ? `"${options.teacherId}"` : "NULL"}`,
      );
    }
    if (options.academicTermId)
      updateFields.push(`academic_term_id = "${options.academicTermId}"`);
    if (options.createdById)
      updateFields.push(`created_by = "${options.createdById}"`);
    if (options.duration) updateFields.push(`duration = "${options.duration}"`);
    updateFields.push(`updated_at = "${options.updatedAt}"`);

    if (updateFields.length > 0) {
      const sql = `UPDATE subjects SET ${updateFields.join(", ")} WHERE id = "${id}"`;
      await pool.execute(sql);
    }
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM subjects WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Subject;
