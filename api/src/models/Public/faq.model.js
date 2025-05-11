const pool = require("../databases/mysql.db");

class FAQ {
  constructor(
    question,
    answer,
    category,
    ordre = 0,
    isActive = true,
    createdBy,
  ) {
    this._question = question;
    this._answer = answer;
    this._category = category;
    this._ordre = ordre;
    this._isActive = isActive;
    this._createdBy = createdBy;
  }

  get question() {
    return this._question;
  }

  set question(question) {
    if (!question) throw new Error("Invalid question value.");
    this._question = question;
  }

  get answer() {
    return this._answer;
  }

  set answer(answer) {
    if (!answer) throw new Error("Invalid answer value.");
    this._answer = answer;
  }

  get category() {
    return this._category;
  }

  set category(category) {
    const validCategories = [
      "Admission",
      "Formation",
      "Financement",
      "Technique",
      "Général",
    ];
    if (!validCategories.includes(category))
      throw new Error("Invalid category value.");
    this._category = category;
  }

  get ordre() {
    return this._ordre;
  }

  set ordre(ordre) {
    this._ordre = ordre;
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(isActive) {
    this._isActive = isActive;
  }

  get createdBy() {
    return this._createdBy;
  }

  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Invalid createdBy value.");
    this._createdBy = createdBy;
  }

  async save() {
    const sql = `INSERT INTO faqs (id, question, answer, category, ordre, isActive, createdBy, createdAt, updatedAt) 
                VALUES (UUID(), "${this.question}", "${this.answer}", "${this.category}", ${this.ordre}, ${this.isActive}, "${this.createdBy}", NOW(), NOW())`;
    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM faqs";
    const [rows, fields] = await pool.execute(sql);
    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    const sql = `UPDATE faqs SET 
                 question = "${options.question}", 
                 answer = "${options.answer}", 
                 category = "${options.category}", 
                 ordre = ${options.ordre}, 
                 isActive = ${options.isActive}, 
                 createdBy = "${options.createdBy}",
                 updatedAt = NOW()
                 WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM faqs WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = FAQ;
