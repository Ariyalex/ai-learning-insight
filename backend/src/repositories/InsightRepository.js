const autoBind = require("auto-bind");
const NotFoundError = require("../exceptions/NotFoundError");

class InsightRepository {
  constructor() {
    this.db = require("../db");
    autoBind(this);
  }

  async getInsight({ userId }) {
    const sql = `
      SELECT *
      FROM insights
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const { rows } = await this.db.query(sql, [userId]);

    if (!rows.length) {
      throw new NotFoundError("Insight tidak ditemukan");
    }

    return rows[0];
  }

  async getAllInsightsByUser({ userId }) {
    const sql = `
    SELECT *
    FROM insights
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

    const { rows } = await this.db.query(sql, [userId]);

    return rows;
  }

  async getInsightByid(id) {
    const sql = `
      SELECT *
      FROM insights
      WHERE id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const { rows } = await this.db.query(sql, [id]);

    if (!rows.length) {
      throw new NotFoundError("Insight tidak ditemukan");
    }

    return rows[0];
  }
}

module.exports = InsightRepository;
