const pool = require("../databases/mysql.db");

class AcademicTerm {
  constructor(name, description, createdById, duration = "3 months") {
    this._name = name;
    this._description = description;
    this._duration = duration;
    this._createdById = createdById;
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

  get duration() {
    return this._duration;
  }

  set duration(duration) {
    if (!duration) throw new Error("Invalid duration value.");
    this._duration = duration;
  }

  get createdById() {
    return this._createdById;
  }

  set createdById(createdById) {
    if (!createdById) throw new Error("Creator ID is required.");
    this._createdById = createdById;
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
    const sql = `INSERT INTO academic_terms (
      id, 
      name, 
      description, 
      duration, 
      created_by, 
      created_at, 
      updated_at
    ) VALUES (
      UUID(), 
      "${this.name}", 
      "${this.description}", 
      "${this.duration}", 
      "${this.createdById}", 
      "${this.createdAt.toISOString()}", 
      "${this.updatedAt.toISOString()}"
    )`;

    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM academic_terms";
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM academic_terms WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0] || null;
  }

  static async findByName(name) {
    const sql = `SELECT * FROM academic_terms WHERE name = "${name}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0] || null;
  }

  static async findByIdAndUpdate(id, options) {
    // Set the updated timestamp
    options.updatedAt = new Date().toISOString();

    // Prepare update fields
    const updateFields = [];

    if (options.name) updateFields.push(`name = "${options.name}"`);
    if (options.description)
      updateFields.push(`description = "${options.description}"`);
    if (options.duration) updateFields.push(`duration = "${options.duration}"`);
    if (options.createdById)
      updateFields.push(`created_by = "${options.createdById}"`);
    updateFields.push(`updated_at = "${options.updatedAt}"`);

    if (updateFields.length > 0) {
      const sql = `UPDATE academic_terms SET ${updateFields.join(", ")} WHERE id = "${id}"`;
      await pool.execute(sql);
    }
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM academic_terms WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = AcademicTerm;
