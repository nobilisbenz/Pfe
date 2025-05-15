const pool = require("../databases/mysql.db");

class ExamResult {
  constructor(
    studentID,
    exam,
    grade,
    score,
    passMark = 50,
    answeredQuestions = [],
    status = "Fail",
    remarks = "Poor",
    classLevel = null,
    academicTerm,
    academicYear,
    isPublished = false,
  ) {
    this._studentID = studentID;
    this._exam = exam;
    this._grade = grade;
    this._score = score;
    this._passMark = passMark;
    this._answeredQuestions = answeredQuestions;
    this._status = status;
    this._remarks = remarks;
    this._classLevel = classLevel;
    this._academicTerm = academicTerm;
    this._academicYear = academicYear;
    this._isPublished = isPublished;
  }

  async save() {
    const answeredQuestionsJSON = JSON.stringify(this._answeredQuestions);
    const sql = `INSERT INTO exam_results 
      (id, student_id, exam_id, grade, score, pass_mark, answered_questions, status, remarks, class_level_id, academic_term_id, academic_year_id, is_published, created_at, updated_at) 
      VALUES 
      (UUID(), "${this._studentID}", "${this._exam}", ${this._grade}, ${this._score}, ${this._passMark}, 
      '${answeredQuestionsJSON}', "${this._status}", "${this._remarks}", 
      ${this._classLevel ? `"${this._classLevel}"` : "NULL"}, 
      "${this._academicTerm}", "${this._academicYear}", ${this._isPublished ? 1 : 0}, 
      NOW(), NOW())`;

    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM exam_results";
    const [rows, fields] = await pool.execute(sql);
    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM exam_results WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);
    return rows[0];
  }

  static async findByIdAndUpdate(id, options) {
    const setClause = Object.entries(options)
      .map(([key, value]) => {
        if (key === "answeredQuestions") {
          return `answered_questions = '${JSON.stringify(value)}'`;
        } else if (key === "isPublished") {
          return `is_published = ${value ? 1 : 0}`;
        } else {
          const sqlKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
          return typeof value === "string"
            ? `${sqlKey} = "${value}"`
            : `${sqlKey} = ${value}`;
        }
      })
      .join(", ");

    const sql = `UPDATE exam_results SET ${setClause}, updated_at = NOW() WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM exam_results WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = ExamResult;
