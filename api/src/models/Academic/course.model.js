const pool = require("../databases/mysql.db");

class Course {
  constructor(
    title,
    description,
    duration,
    level,
    price,
    image = "📚",
    program,
    status = "À venir",
    maxStudents = 30,
    enrolledStudents = [],
    teacher = null,
    createdBy,
  ) {
    this._title = title;
    this._description = description;
    this._duration = duration;
    this._level = level;
    this._price = price;
    this._image = image;
    this._program = program;
    this._status = status;
    this._maxStudents = maxStudents;
    this._enrolledStudents = enrolledStudents;
    this._teacher = teacher;
    this._createdBy = createdBy;
  }

  // Getters and setters
  get title() {
    return this._title;
  }
  set title(title) {
    if (!title) throw new Error("Invalid title value.");
    title = title.trim();
    if (title === "") throw new Error("Invalid title value.");
    this._title = title;
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

  get level() {
    return this._level;
  }
  set level(level) {
    const validLevels = ["Débutant", "Intermédiaire", "Avancé"];
    if (!validLevels.includes(level)) throw new Error("Invalid level value.");
    this._level = level;
  }

  get price() {
    return this._price;
  }
  set price(price) {
    if (price < 0) throw new Error("Invalid price value.");
    this._price = price;
  }

  get image() {
    return this._image;
  }
  set image(image) {
    this._image = image || "📚";
  }

  get program() {
    return this._program;
  }
  set program(program) {
    if (!program) throw new Error("Program is required.");
    this._program = program;
  }

  get status() {
    return this._status;
  }
  set status(status) {
    const validStatus = ["En cours", "À venir", "Terminé"];
    if (!validStatus.includes(status)) throw new Error("Invalid status value.");
    this._status = status;
  }

  get maxStudents() {
    return this._maxStudents;
  }
  set maxStudents(maxStudents) {
    if (maxStudents < 0) throw new Error("Invalid maxStudents value.");
    this._maxStudents = maxStudents;
  }

  get enrolledStudents() {
    return this._enrolledStudents;
  }
  set enrolledStudents(enrolledStudents) {
    if (!Array.isArray(enrolledStudents))
      throw new Error("enrolledStudents must be an array.");
    this._enrolledStudents = enrolledStudents;
  }

  get teacher() {
    return this._teacher;
  }
  set teacher(teacher) {
    this._teacher = teacher;
  }

  get createdBy() {
    return this._createdBy;
  }
  set createdBy(createdBy) {
    if (!createdBy) throw new Error("createdBy is required.");
    this._createdBy = createdBy;
  }

  async save() {
    const enrolledStudentsJSON = JSON.stringify(this.enrolledStudents);
    const sql = `INSERT INTO courses (
      id, title, description, duration, level, price, image, program, 
      status, maxStudents, enrolledStudents, teacher, createdBy, createdAt, updatedAt
    ) VALUES (
      UUID(), "${this.title}", "${this.description}", "${this.duration}", 
      "${this.level}", ${this.price}, "${this.image}", "${this.program}",
      "${this.status}", ${this.maxStudents}, '${enrolledStudentsJSON}', 
      ${this.teacher ? `"${this.teacher}"` : "NULL"}, "${this.createdBy}", 
      NOW(), NOW()
    )`;
    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM courses";
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    const enrolledStudentsJSON = options.enrolledStudents
      ? JSON.stringify(options.enrolledStudents)
      : null;

    let updateFields = [];
    if (options.title) updateFields.push(`title = "${options.title}"`);
    if (options.description)
      updateFields.push(`description = "${options.description}"`);
    if (options.duration) updateFields.push(`duration = "${options.duration}"`);
    if (options.level) updateFields.push(`level = "${options.level}"`);
    if (options.price !== undefined)
      updateFields.push(`price = ${options.price}`);
    if (options.image) updateFields.push(`image = "${options.image}"`);
    if (options.program) updateFields.push(`program = "${options.program}"`);
    if (options.status) updateFields.push(`status = "${options.status}"`);
    if (options.maxStudents !== undefined)
      updateFields.push(`maxStudents = ${options.maxStudents}`);
    if (enrolledStudentsJSON)
      updateFields.push(`enrolledStudents = '${enrolledStudentsJSON}'`);
    if (options.teacher !== undefined)
      updateFields.push(
        `teacher = ${options.teacher ? `"${options.teacher}"` : "NULL"}`,
      );
    if (options.createdBy)
      updateFields.push(`createdBy = "${options.createdBy}"`);
    updateFields.push(`updatedAt = NOW()`);

    const sql = `UPDATE courses SET ${updateFields.join(", ")} WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM courses WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Course;
