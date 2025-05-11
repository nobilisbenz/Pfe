const pool = require("../databases/mysql.db");

class Admin {
  constructor(name, email, password, role = "user") {
    this._name = name;
    this._email = email;
    this._password = password;
    this._role = role;
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

  get email() {
    return this._email;
  }

  set email(email) {
    if (!email) throw new Error("Invalid email value.");

    email = email.trim();
    if (email === "") throw new Error("Invalid email value.");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Invalid email format.");

    this._email = email;
  }

  get password() {
    return this._password;
  }

  set password(password) {
    if (!password) throw new Error("Invalid password value.");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");

    this._password = password;
  }

  get role() {
    return this._role;
  }

  set role(role) {
    const validRoles = ["user", "admin", "superadmin"];
    if (!validRoles.includes(role)) throw new Error("Invalid role value.");

    this._role = role;
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
    const sql = `INSERT INTO admins (id, name, email, password, role, created_at, updated_at) 
                VALUES (UUID(), "${this.name}", "${this.email}", "${this.password}", "${this.role}", 
                "${this.createdAt.toISOString()}", "${this.updatedAt.toISOString()}")`;
    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM admins";
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM admins WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0] || null;
  }

  static async findByEmail(email) {
    const sql = `SELECT * FROM admins WHERE email = "${email}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0] || null;
  }

  static async findByIdAndUpdate(id, options) {
    // Set the updated timestamp
    options.updatedAt = new Date().toISOString();

    let updateFields = Object.entries(options)
      .map(([key, value]) => {
        // Convert camelCase to snake_case for DB fields
        const field = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${field} = "${value}"`;
      })
      .join(", ");

    const sql = `UPDATE admins SET ${updateFields} WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM admins WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Admin;
