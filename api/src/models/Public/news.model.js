const pool = require("../databases/mysql.db");

class News {
  constructor(
    title,
    content,
    summary,
    image = "📰",
    category,
    createdBy,
    isPublished = true,
  ) {
    this._title = title;
    this._content = content;
    this._summary = summary;
    this._image = image;
    this._category = category;
    this._createdBy = createdBy;
    this._isPublished = isPublished;
  }

  get title() {
    return this._title;
  }

  set title(title) {
    if (!title) throw new Error("Invalid title value.");
    this._title = title;
  }

  get content() {
    return this._content;
  }

  set content(content) {
    if (!content) throw new Error("Invalid content value.");
    this._content = content;
  }

  get summary() {
    return this._summary;
  }

  set summary(summary) {
    if (!summary) throw new Error("Invalid summary value.");
    this._summary = summary;
  }

  get image() {
    return this._image;
  }

  set image(image) {
    this._image = image;
  }

  get category() {
    return this._category;
  }

  set category(category) {
    const validCategories = ["Formation", "Événement", "Annonce", "Actualité"];
    if (!validCategories.includes(category))
      throw new Error("Invalid category value.");
    this._category = category;
  }

  get createdBy() {
    return this._createdBy;
  }

  set createdBy(createdBy) {
    if (!createdBy) throw new Error("Invalid createdBy value.");
    this._createdBy = createdBy;
  }

  get isPublished() {
    return this._isPublished;
  }

  set isPublished(isPublished) {
    this._isPublished = isPublished;
  }

  async save() {
    const sql = `INSERT INTO news (id, title, content, summary, image, category, createdBy, isPublished, createdAt, updatedAt) 
                VALUES (UUID(), "${this.title}", "${this.content}", "${this.summary}", "${this.image}", "${this.category}", "${this.createdBy}", ${this.isPublished}, NOW(), NOW())`;
    await pool.execute(sql);
  }

  static async find() {
    const sql = "SELECT * FROM news";
    const [rows, fields] = await pool.execute(sql);
    return rows;
  }

  static async findByIdAndUpdate(id, options) {
    const sql = `UPDATE news SET 
                 title = "${options.title}", 
                 content = "${options.content}", 
                 summary = "${options.summary}", 
                 image = "${options.image}", 
                 category = "${options.category}", 
                 createdBy = "${options.createdBy}",
                 isPublished = ${options.isPublished},
                 updatedAt = NOW()
                 WHERE id = "${id}"`;
    await pool.execute(sql);
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM news WHERE id = "${id}"`;
    await pool.execute(sql);
  }
}

module.exports = News;
