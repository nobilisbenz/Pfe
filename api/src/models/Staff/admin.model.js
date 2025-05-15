const bcrypt = require("bcryptjs");
const pool = require("../../databases/mysql.db");

class Admin {
  constructor(name, email, password, role = "user") {
    this._name = name;
    this._email = email;
    this._password = password; // This will be hashed before saving
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

  // Helper method to hash password
  async hashPassword() {
    if (this._password) {
      const salt = await bcrypt.genSalt(10);
      this._password = await bcrypt.hash(this._password, salt);
    }
  }

  // Method to compare passwords for authentication
  static async comparePassword(enteredPassword, hashedPassword) {
    if (!enteredPassword) {
      return false;
    }
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  async save() {
    // Hash the password before saving
    await this.hashPassword();

    const sql = `INSERT INTO admins (id, name, email, password, role, created_at, updated_at) 
                VALUES (UUID(), ?, ?, ?, ?, ?, ?)`;
    const values = [
      this.name,
      this.email,
      this.password,
      this.role,
      this.createdAt.toISOString().slice(0, 19).replace("T", " "),
      this.updatedAt.toISOString().slice(0, 19).replace("T", " "),
    ];

    // Using parameterized queries to prevent SQL injection
    await pool.execute(sql, values);
  }

  static async find() {
    const sql = "SELECT * FROM admins";
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async findById(id, excludeFields = []) {
    const fieldsToSelect = ["id", "name", "email", "role"]; // Add all fields you might want
    const selectedFields = fieldsToSelect
      .filter((f) => !excludeFields.includes(f))
      .join(", ");

    const sql = `SELECT ${selectedFields} FROM admins WHERE id = ?`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const sql = "SELECT * FROM admins WHERE email = ?";
    const [rows] = await pool.execute(sql, [email]);
    return rows[0] || null;
  }

  static async findByIdAndUpdate(id, options) {
    // If password is being updated, hash it first
    if (options.password) {
      const salt = await bcrypt.genSalt(10);
      options.password = await bcrypt.hash(options.password, salt);
    }

    // Set the updated timestamp
    options.updatedAt = new Date().toISOString();

    let updateFields = Object.entries(options)
      .map(([key]) => {
        // Convert camelCase to snake_case for DB fields
        return `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = ?`;
      })
      .join(", ");

    const values = Object.values(options);
    values.push(id);

    const sql = `UPDATE admins SET ${updateFields} WHERE id = ?`;
    await pool.execute(sql, values);
  }

  static async findByIdAndDelete(id) {
    const sql = "DELETE FROM admins WHERE id = ?";
    await pool.execute(sql, [id]);
  }
}

module.exports = Admin;
