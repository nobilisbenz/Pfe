const pool = require("../databases/mysql.db");

class YearGroup {
  constructor(name, createdBy, academicYear, students = []) {
    this._name = name;
    this._createdBy = createdBy;
    this._academicYear = academicYear;
    this._students = students;
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

  get createdBy() {
    return this._createdBy;
  }

  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Invalid createdBy value.");
    this._createdBy = createdBy;
  }

  get academicYear() {
    return this._academicYear;
  }

  set academicYear(academicYear) {
    if (!academicYear) throw new Error("Invalid academicYear value.");
    this._academicYear = academicYear;
  }

  get students() {
    return this._students;
  }

  set students(students) {
    if (!Array.isArray(students)) throw new Error("Students must be an array.");
    this._students = students;
  }

  async save() {
    // Insert year group
    const sql = `INSERT INTO year_groups (name, created_by, academic_year, created_at, updated_at) 
                VALUES ("${this.name}", "${this.createdBy}", "${this.academicYear}", NOW(), NOW())`;

    const [result] = await pool.execute(sql);
    const yearGroupId = result.insertId;

    // Insert student associations if any
    if (this.students.length > 0) {
      const studentValues = this.students
        .map((studentId) => `(${yearGroupId}, "${studentId}")`)
        .join(", ");
      const studentSql = `INSERT INTO year_group_students (year_group_id, student_id) VALUES ${studentValues}`;
      await pool.execute(studentSql);
    }

    return yearGroupId;
  }

  static async find() {
    const sql = "SELECT * FROM year_groups";
    const [rows] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM year_groups WHERE id = ${id}`;
    const [rows] = await pool.execute(sql);

    if (rows.length === 0) return null;

    // Get associated students
    const studentSql = `SELECT student_id FROM year_group_students WHERE year_group_id = ${id}`;
    const [students] = await pool.execute(studentSql);

    const yearGroup = rows[0];
    yearGroup.students = students.map((s) => s.student_id);

    return yearGroup;
  }

  static async findByIdAndUpdate(id, updates) {
    // Update year group details
    const sql = `UPDATE year_groups 
                SET name = "${updates.name}", 
                    created_by = "${updates.createdBy}", 
                    academic_year = "${updates.academicYear}",
                    updated_at = NOW() 
                WHERE id = ${id}`;

    await pool.execute(sql);

    // Update student associations if provided
    if (updates.students) {
      // Remove existing associations
      await pool.execute(
        `DELETE FROM year_group_students WHERE year_group_id = ${id}`,
      );

      // Add new associations
      if (updates.students.length > 0) {
        const studentValues = updates.students
          .map((studentId) => `(${id}, "${studentId}")`)
          .join(", ");
        const studentSql = `INSERT INTO year_group_students (year_group_id, student_id) VALUES ${studentValues}`;
        await pool.execute(studentSql);
      }
    }
  }

  static async findByIdAndDelete(id) {
    // Delete student associations first
    await pool.execute(
      `DELETE FROM year_group_students WHERE year_group_id = ${id}`,
    );

    // Delete year group
    const sql = `DELETE FROM year_groups WHERE id = ${id}`;
    await pool.execute(sql);
  }

  static async findByAcademicYear(academicYearId) {
    const sql = `SELECT * FROM year_groups WHERE academic_year = "${academicYearId}"`;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = YearGroup;
