const autoBind = require("auto-bind");

class TrackingRepository {
  constructor() {
    this.db = require("../db");
    autoBind(this);
  }

  async getTabel({ developerId }) {
    if (!developerId) throw new Error("developerId is required");

    const sql = `
  SELECT
    developer_id::int AS developer_id,
    to_char(date_trunc('week', last_viewed), 'YYYY-MM-DD')         AS start_date,
    to_char(date_trunc('week', last_viewed) + INTERVAL '6 days', 'YYYY-MM-DD') AS end_date,
    COUNT(*)::int AS total
  FROM developer_journey_trackings
  WHERE developer_id = $1
  GROUP BY
    developer_id,
    date_trunc('week', last_viewed)
  ORDER BY
    date_trunc('week', last_viewed) ASC;
`;

    const { rows } = await this.db.query(sql, [Number(developerId)]);
    return { items: rows };
  }
}

module.exports = TrackingRepository;
