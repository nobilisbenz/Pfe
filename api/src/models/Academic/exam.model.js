const pool = require("../databases/mysql.db");

class Exam {
  constructor(
    name,
    description,
    subject,
    program,
    passMark = 50,
    totalMark = 100,
    academicTerm,
    duration = "30 minutes",
    examDate = new Date(),
    examTime,
    examType = "Quiz",
    examStatus = "pending",
    classLevel,
    createdBy,
    academicYear,
    questions = [],
  ) {
    this._name = name;
    this._description = description;
    this._subject = subject;
    this._program = program;
    this._passMark = passMark;
    this._totalMark = totalMark;
    this._academicTerm = academicTerm;
    this._duration = duration;
    this._examDate = examDate;
    this._examTime = examTime;
    this._examType = examType;
    this._examStatus = examStatus;
    this._classLevel = classLevel;
    this._createdBy = createdBy;
    this._academicYear = academicYear;
    this._questions = questions;
  }

  // Getters and setters for all properties
  get name() {
    return this._name;
  }
  set name(name) {
    if (!name) throw new Error("Name is required");
    this._name = name;
  }

  get description() {
    return this._description;
  }
  set description(description) {
    if (!description) throw new Error("Description is required");
    this._description = description;
  }

  // More getters and setters would follow for all properties

  async save() {
    const sql = `INSERT INTO exams (
      id, name, description, subject_id, program_id, pass_mark, total_mark,
      academic_term_id, duration, exam_date, exam_time, exam_type, exam_status,
      class_level_id, created_by, academic_year_id, created_at, updated_at
    ) VALUES (
      UUID(), "${this.name}", "${this.description}", "${this._subject}", 
      "${this._program}", ${this._passMark}, ${this._totalMark},
      "${this._academicTerm}", "${this._duration}", 
      "${this._examDate.toISOString().slice(0, 10)}", "${this._examTime}", 
      "${this._examType}", "${this._examStatus}", "${this._classLevel}",
      "${this._createdBy}", "${this._academicYear}", 
      NOW(), NOW()
    )`;

    const [result] = await pool.execute(sql);
    const examId = result.insertId;

    // Handle questions (many-to-many relationship)
    if (this._questions.length > 0) {
      for (const questionId of this._questions) {
        await pool.execute(
          `INSERT INTO exam_questions (exam_id, question_id) VALUES ("${examId}", "${questionId}")`,
        );
      }
    }

    return examId;
  }

  static async find() {
    const sql = "SELECT * FROM exams";
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM exams WHERE id = "${id}"`;
    const [rows] = await pool.execute(sql);
    return rows[0];
  }

  static async findByIdAndUpdate(id, options) {
    const sql = `UPDATE exams SET 
      name = "${options.name}", 
      description = "${options.description}",
      subject_id = "${options.subject}",
      program_id = "${options.program}",
      pass_mark = ${options.passMark},
      total_mark = ${options.totalMark},
      academic_term_id = "${options.academicTerm}",
      duration = "${options.duration}",
      exam_date = "${options.examDate.toISOString().slice(0, 10)}",
      exam_time = "${options.examTime}",
      exam_type = "${options.examType}",
      exam_status = "${options.examStatus}",
      class_level_id = "${options.classLevel}",
      created_by = "${options.createdBy}",
      academic_year_id = "${options.academicYear}",
      updated_at = NOW()
      WHERE id = "${id}"`;

    await pool.execute(sql);

    // Handle questions update if needed
    if (options.questions) {
      // Remove existing questions
      await pool.execute(`DELETE FROM exam_questions WHERE exam_id = "${id}"`);

      // Add new questions
      for (const questionId of options.questions) {
        await pool.execute(
          `INSERT INTO exam_questions (exam_id, question_id) VALUES ("${id}", "${questionId}")`,
        );
      }
    }
  }

  static async findByIdAndDelete(id) {
    // First remove question associations
    await pool.execute(`DELETE FROM exam_questions WHERE exam_id = "${id}"`);

    // Then delete the exam
    const sql = `DELETE FROM exams WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = Exam;
