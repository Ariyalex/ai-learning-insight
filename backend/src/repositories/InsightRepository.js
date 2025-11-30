const autoBind = require("auto-bind");

class InsightRepository {
  constructor() {
    this.db = require("../db");
    autoBind(this);
  }

  async findMany({ userId, cluster, limit, offset, order }) {
    const where = [];
    const params = [];

    if (userId !== undefined && userId !== null && userId !== "") {
      params.push(Number(userId));
      where.push(`user_id = $${params.length}`);
    }
    if (cluster !== undefined && cluster !== null && cluster !== "") {
      params.push(Number(cluster));
      where.push(`cluster = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `
      SELECT *
      FROM insights
      ${whereSql}
      ORDER BY id ${order === "ASC" ? "ASC" : "DESC"}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await this.db.query(sql, params);
    return rows;
  }
}

module.exports = InsightRepository;
