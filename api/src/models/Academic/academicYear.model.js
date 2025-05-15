const pool = require("../databases/mysql.db");
const { v4: uuidv4 } = require("uuid");

class AcademicYear {
  constructor(name, fromYear, toYear, createdById, isCurrent = false) {
    this._name = name;
    this._fromYear = fromYear instanceof Date ? fromYear : new Date(fromYear);
    this._toYear = toYear instanceof Date ? toYear : new Date(toYear);
    this._isCurrent = isCurrent;
    this._createdById = createdById;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._students = [];
    this._teachers = [];
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

  get fromYear() {
    return this._fromYear;
  }

  set fromYear(fromYear) {
    if (!fromYear) throw new Error("From year is required.");
    this._fromYear = fromYear instanceof Date ? fromYear : new Date(fromYear);
  }

  get toYear() {
    return this._toYear;
  }

  set toYear(toYear) {
    if (!toYear) throw new Error("To year is required.");
    this._toYear = toYear instanceof Date ? toYear : new Date(toYear);

    // Validate that toYear is after fromYear
    if (this._toYear <= this._fromYear) {
      throw new Error("To year must be after from year.");
    }
  }

  get isCurrent() {
    return this._isCurrent;
  }

  set isCurrent(isCurrent) {
    this._isCurrent = !!isCurrent; // Convert to boolean
  }

  get createdById() {
    return this._createdById;
  }

  set createdById(createdById) {
    if (!createdById) throw new Error("Creator ID is required.");
    this._createdById = createdById;
  }

  get students() {
    return this._students;
  }

  set students(students) {
    if (!Array.isArray(students)) throw new Error("Students must be an array.");
    this._students = students;
  }

  get teachers() {
    return this._teachers;
  }

  set teachers(teachers) {
    if (!Array.isArray(teachers)) throw new Error("Teachers must be an array.");
    this._teachers = teachers;
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
    // If this is set as current, update other academic years to not be current
    if (this.isCurrent) {
      await pool.execute(`UPDATE academic_years SET is_current = 0`);
    }

    const academicYearId = uuidv4();

    // Save the main academic year data
    const sql = `
      INSERT INTO academic_years (
        id, name, from_year, to_year, is_current, created_by, created_at, updated_at
      ) VALUES (
        "${academicYearId}", 
        "${this.name}", 
        "${this.fromYear.toISOString()}", 
        "${this.toYear.toISOString()}", 
        ${this.isCurrent ? 1 : 0}, 
        "${this.createdById}", 
        "${this.createdAt.toISOString()}", 
        "${this.updatedAt.toISOString()}"
      )
    `;

    await pool.execute(sql);

    // Save relationships for students and teachers
    await this._saveRelationships(
      "academic_year_students",
      academicYearId,
      this.students,
    );
    await this._saveRelationships(
      "academic_year_teachers",
      academicYearId,
      this.teachers,
    );

    return academicYearId;
  }

  async _saveRelationships(tableName, academicYearId, items) {
    for (const itemId of items) {
      const sql = `
        INSERT INTO ${tableName} (id, academic_year_id, item_id)
        VALUES ("${uuidv4()}", "${academicYearId}", "${itemId}")
      `;
      await pool.execute(sql);
    }
  }

  static async find() {
    const sql = "SELECT * FROM academic_years";
    const [rows, fields] = await pool.execute(sql);

    // For each academic year, load relationships
    for (const academicYear of rows) {
      await AcademicYear._loadRelationships(academicYear);
    }

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM academic_years WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    if (rows.length === 0) return null;

    const academicYear = rows[0];
    await AcademicYear._loadRelationships(academicYear);

    return academicYear;
  }

  static async getCurrent() {
    const sql = `SELECT * FROM academic_years WHERE is_current = 1`;
    const [rows, fields] = await pool.execute(sql);

    if (rows.length === 0) return null;

    const academicYear = rows[0];
    await AcademicYear._loadRelationships(academicYear);

    return academicYear;
  }

  static async _loadRelationships(academicYear) {
    // Load students
    academicYear.students = await AcademicYear._getRelatedItems(
      "academic_year_students",
      academicYear.id,
    );

    // Load teachers
    academicYear.teachers = await AcademicYear._getRelatedItems(
      "academic_year_teachers",
      academicYear.id,
    );
  }

  static async _getRelatedItems(tableName, academicYearId) {
    const sql = `SELECT item_id FROM ${tableName} WHERE academic_year_id = "${academicYearId}"`;
    const [rows] = await pool.execute(sql);
    return rows.map((row) => row.item_id);
  }

  static async findByIdAndUpdate(id, options) {
    const academicYear = await AcademicYear.findById(id);
    if (!academicYear) throw new Error(`Academic year with id ${id} not found`);

    // If setting this as current, update other academic years to not be current
    if (options.isCurrent) {
      await pool.execute(`UPDATE academic_years SET is_current = 0`);
    }

    // Update the academic year
    const updatedAt = new Date().toISOString();

    // Prepare update fields
    const updateFields = [];
    if (options.name) updateFields.push(`name = "${options.name}"`);
    if (options.fromYear)
      updateFields.push(
        `from_year = "${new Date(options.fromYear).toISOString()}"`,
      );
    if (options.toYear)
      updateFields.push(
        `to_year = "${new Date(options.toYear).toISOString()}"`,
      );
    if (options.isCurrent !== undefined)
      updateFields.push(`is_current = ${options.isCurrent ? 1 : 0}`);
    if (options.createdById)
      updateFields.push(`created_by = "${options.createdById}"`);
    updateFields.push(`updated_at = "${updatedAt}"`);

    if (updateFields.length > 0) {
      const sql = `UPDATE academic_years SET ${updateFields.join(", ")} WHERE id = "${id}"`;
      await pool.execute(sql);
    }

    // Update relationships if provided
    if (options.students) {
      await pool.execute(
        `DELETE FROM academic_year_students WHERE academic_year_id = "${id}"`,
      );
      for (const studentId of options.students) {
        await pool.execute(`
          INSERT INTO academic_year_students (id, academic_year_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${studentId}")
        `);
      }
    }

    if (options.teachers) {
      await pool.execute(
        `DELETE FROM academic_year_teachers WHERE academic_year_id = "${id}"`,
      );
      for (const teacherId of options.teachers) {
        await pool.execute(`
          INSERT INTO academic_year_teachers (id, academic_year_id, item_id)
          VALUES ("${uuidv4()}", "${id}", "${teacherId}")
        `);
      }
    }
  }

  static async findByIdAndDelete(id) {
    // Delete relationships
    await pool.execute(
      `DELETE FROM academic_year_students WHERE academic_year_id = "${id}"`,
    );
    await pool.execute(
      `DELETE FROM academic_year_teachers WHERE academic_year_id = "${id}"`,
    );

    // Delete academic year
    await pool.execute(`DELETE FROM academic_years WHERE id = "${id}"`);
  }
}

module.exports = AcademicYear;
