const pool = require("../databases/mysql.db");

class Question {
  constructor(
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    createdBy,
    isCorrect = false,
  ) {
    this._question = question;
    this._optionA = optionA;
    this._optionB = optionB;
    this._optionC = optionC;
    this._optionD = optionD;
    this._correctAnswer = correctAnswer;
    this._createdBy = createdBy;
    this._isCorrect = isCorrect;
  }

  get question() {
    return this._question;
  }

  set question(question) {
    if (!question) throw new Error("Invalid question value.");

    question = question.trim();
    if (question === "") throw new Error("Invalid question value.");

    this._question = question;
  }

  get optionA() {
    return this._optionA;
  }

  set optionA(optionA) {
    if (!optionA) throw new Error("Invalid optionA value.");

    optionA = optionA.trim();
    if (optionA === "") throw new Error("Invalid optionA value.");

    this._optionA = optionA;
  }

  get optionB() {
    return this._optionB;
  }

  set optionB(optionB) {
    if (!optionB) throw new Error("Invalid optionB value.");

    optionB = optionB.trim();
    if (optionB === "") throw new Error("Invalid optionB value.");

    this._optionB = optionB;
  }

  get optionC() {
    return this._optionC;
  }

  set optionC(optionC) {
    if (!optionC) throw new Error("Invalid optionC value.");

    optionC = optionC.trim();
    if (optionC === "") throw new Error("Invalid optionC value.");

    this._optionC = optionC;
  }

  get optionD() {
    return this._optionD;
  }

  set optionD(optionD) {
    if (!optionD) throw new Error("Invalid optionD value.");

    optionD = optionD.trim();
    if (optionD === "") throw new Error("Invalid optionD value.");

    this._optionD = optionD;
  }

  get correctAnswer() {
    return this._correctAnswer;
  }

  set correctAnswer(correctAnswer) {
    if (!correctAnswer) throw new Error("Invalid correctAnswer value.");

    correctAnswer = correctAnswer.trim();
    if (correctAnswer === "") throw new Error("Invalid correctAnswer value.");

    this._correctAnswer = correctAnswer;
  }

  get createdBy() {
    return this._createdBy;
  }

  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Invalid createdBy value.");

    this._createdBy = createdBy;
  }

  get isCorrect() {
    return this._isCorrect;
  }

  set isCorrect(isCorrect) {
    this._isCorrect = Boolean(isCorrect);
  }

  async save() {
    const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
    const updated_at = created_at;

    const sql = `INSERT INTO questions (id, question, option_a, option_b, option_c, option_d, correct_answer, is_correct, created_by, created_at, updated_at) 
                VALUES (UUID(), "${this.question}", "${this.optionA}", "${this.optionB}", "${this.optionC}", "${this.optionD}", "${this.correctAnswer}", ${this.isCorrect ? 1 : 0}, "${this.createdBy}", "${created_at}", "${updated_at}")`;
    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM questions";
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM questions WHERE id = "${id}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows[0];
  }

  static async findByIdAndUpdate(id, options) {
    const updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");

    const sql = `UPDATE questions SET 
                question = "${options.question}", 
                option_a = "${options.optionA}", 
                option_b = "${options.optionB}", 
                option_c = "${options.optionC}", 
                option_d = "${options.optionD}", 
                correct_answer = "${options.correctAnswer}", 
                is_correct = ${options.isCorrect ? 1 : 0}, 
                created_by = "${options.createdBy}",
                updated_at = "${updated_at}"
                WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM questions WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByCreatedBy(teacherId) {
    const sql = `SELECT * FROM questions WHERE created_by = "${teacherId}"`;
    const [rows, fields] = await pool.execute(sql);

    return rows;
  }
}

module.exports = Question;
