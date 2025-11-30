const autoBind = require("auto-bind");

class JourneyTrackingRepository {
  constructor() {
    this.db = require("../db");
    autoBind(this);
  }

  async findMany({ developerId, developer_id } = {}) {
    const devId = developerId ?? developer_id;

    const params = [];
    const where = [];

    if (
      devId !== undefined &&
      devId !== null &&
      String(devId).trim() !== "" &&
      Number.isFinite(Number(devId))
    ) {
      params.push(Number(devId));
      where.push(`developer_id = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const selectDeveloper = params.length
      ? `MIN(developer_id)::int AS developer_id,`
      : `developer_id::int AS developer_id,`;

    const groupBy = params.length
      ? `GROUP BY bucket_start`
      : `GROUP BY developer_id, bucket_start`;

    const sql = `
    WITH base AS (
      SELECT
        developer_id,
        last_viewed::date AS d,
        (DATE '1970-01-01'
           + (((last_viewed::date - DATE '1970-01-01') / 4) * INTERVAL '4 days')
         )::date AS bucket_start
      FROM developer_journey_trackings
      ${whereSql}
    )
    SELECT
      ${selectDeveloper}
      bucket_start::text AS start_date,
      (bucket_start + INTERVAL '3 days')::date::text AS end_date,
      COUNT(*)::int AS total
    FROM base
    ${groupBy}
    ORDER BY start_date ASC
  `;

    const { rows } = await this.db.query(sql, params);

    return {
      items: rows,
      total: rows.length,
      limit: rows.length,
      offset: 0,
      has_more: false,
    };
  }
}

module.exports = JourneyTrackingRepository;
