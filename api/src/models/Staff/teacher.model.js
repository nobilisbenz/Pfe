const pool = require("../databases/mysql.db");

class Teacher {
  constructor(
    name,
    email,
    phone,
    password,
    program = null,
    classLevel = null,
    academicYear = null,
    academicTerm = null,
  ) {
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._password = password;
    this._program = program;
    this._classLevel = classLevel;
    this._academicYear = academicYear;
    this._academicTerm = academicTerm;
  }

  // Getters and setters for each property
  get name() {
    return this._name;
  }

  set name(name) {
    if (!name) throw new Error("Name is required");
    this._name = name;
  }

  get email() {
    return this._email;
  }

  set email(email) {
    if (!email) throw new Error("Email is required");
    this._email = email;
  }

  get phone() {
    return this._phone;
  }

  set phone(phone) {
    if (!phone) throw new Error("Phone is required");
    this._phone = phone;
  }

  get password() {
    return this._password;
  }

  set password(password) {
    if (!password) throw new Error("Password is required");
    this._password = password;
  }

  // Generate teacherId
  generateTeacherId() {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const datePart = Date.now().toString().slice(2, 4);
    const initials = this.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
    return `TEA${randomNum}${datePart}${initials}`;
  }

  async save() {
    const teacherId = this.generateTeacherId();
    const dateEmployed = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const sql = `INSERT INTO teachers 
      (name, email, phone, password, dateEmployed, teacherId, program, classLevel, academicYear, academicTerm, role, isWitdrawn, isSuspended, applicationStatus) 
      VALUES 
      ("${this.name}", "${this.email}", "${this.phone}", "${this.password}", "${dateEmployed}", "${teacherId}", 
      ${this.program ? `"${this.program}"` : "NULL"}, 
      ${this.classLevel ? `"${this.classLevel}"` : "NULL"}, 
      ${this.academicYear ? `"${this.academicYear}"` : "NULL"}, 
      ${this.academicTerm ? `"${this.academicTerm}"` : "NULL"}, 
      "teacher", false, false, "pending")`;

    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM teachers";
    const [rows, fields] = await pool.execute(sql);
    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM teachers WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);
    return rows[0];
  }

  static async findByIdAndUpdate(id, options) {
    let updateFields = Object.entries(options)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => {
        if (value === null) return `${key} = NULL`;
        return typeof value === "string"
          ? `${key} = "${value}"`
          : `${key} = ${value}`;
      })
      .join(", ");

    const sql = `UPDATE teachers SET ${updateFields} WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM teachers WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Teacher;
