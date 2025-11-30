const autoBind = require("auto-bind");

class JourneyTrackingRepository {
  constructor() {
    this.db = require("../db");
    autoBind(this);
  }

  async findMany({
    developerId,
    journeyId,
    tutorialId,
    limit = 50,
    offset = 0,
  } = {}) {
    const where = [];
    const params = [];

    if (developerId) {
      params.push(Number(developerId));
      where.push(`developer_id = $${params.length}`);
    }

    if (journeyId) {
      params.push(Number(journeyId));
      where.push(`journey_id = $${params.length}`);
    }

    if (tutorialId) {
      params.push(Number(tutorialId));
      where.push(`tutorial_id = $${params.length}`);
    }

    // sanitasi angka biar aman
    const lim =
      Number.isFinite(Number(limit)) && Number(limit) > 0
        ? Math.min(Number(limit), 100)
        : 20;
    const off =
      Number.isFinite(Number(offset)) && Number(offset) >= 0
        ? Number(offset)
        : 0;

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 1 query: ambil data + total baris (tanpa limit) via window function
    const sql = `
    SELECT
      id,
      journey_id,
      tutorial_id,
      developer_id,
      last_viewed,
      first_opened_at,
      completed_at,
      COUNT(*) OVER() AS __total
    FROM developer_journey_trackings
    ${whereSql}
    ORDER BY last_viewed DESC
    LIMIT ${lim} OFFSET ${off}
  `;

    const { rows } = await this.db.query(sql, params);

    const total = rows[0]?.__total ? Number(rows[0].__total) : 0;
    const items = rows.map((r) => {
      const { __total, ...rest } = r;
      return rest;
    });

    return {
      items,
      total,
      limit: lim,
      offset: off,
      has_more: off + items.length < total,
    };
  }

  async findById(id) {
    const sql = `
      SELECT *
      FROM developer_journey_trackings
      WHERE id = $1
    `;
    const { rows } = await this.db.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Insert data tracking (jika diperlukan)
   * - HANYA jika kamu mau insert manual dari backend
   */
  async create({
    journeyId,
    tutorialId,
    developerId,
    lastViewed,
    firstOpenedAt,
    completedAt,
  }) {
    const sql = `
      INSERT INTO developer_journey_trackings 
        (journey_id, tutorial_id, developer_id, last_viewed, first_opened_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const params = [
      journeyId,
      tutorialId,
      developerId,
      lastViewed,
      firstOpenedAt || null,
      completedAt || null,
    ];

    const { rows } = await this.db.query(sql, params);
    return rows[0];
  }
}

module.exports = JourneyTrackingRepository;
