const fs = require("fs");
const { parse } = require("csv-parse");
const bcrypt = require("bcryptjs");

/**
 * Import users from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importJourneySubmissions(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    let inserted = 0,
      skipped = 0;

    const parseNullableInt = (value) => {
      const raw = (value || "").toString().replace(/,/g, "").trim();
      if (raw === "") return null;
      const n = parseInt(raw, 10);
      return Number.isNaN(n) ? null : n;
    };

    const parseNullableTimestamp = (value) => {
      const raw = (value || "").toString().trim();
      if (raw === "") return null;
      // try Date.parse; fall back to simple comma removal (e.g. "Oct 31, 2023, 13:08")
      let t = Date.parse(raw);
      if (Number.isNaN(t)) {
        const alt = raw.replace(/,\s*/g, " ");
        t = Date.parse(alt);
      }
      if (Number.isNaN(t)) {
        console.warn(`warning: unparseable timestamp "${raw}", inserting NULL`);
        return null;
      }
      return new Date(t).toISOString(); // PG accepts ISO string for timestamptz
    };

    for await (const row of parser) {
      const id = parseNullableInt(row.id);
      const submitter_id = parseNullableInt(row.submitter_id);
      const journey_id = parseNullableInt(row.journey_id);
      const quiz_id = parseNullableInt(row.quiz_id);
      const created_at = parseNullableTimestamp(row.created_at);
      const updated_at = parseNullableTimestamp(row.updated_at);
      const rating = parseNullableInt(row.rating);
      const submission_duration = parseNullableInt(row.submission_duration);

      try {
        await client.query(
          `INSERT INTO developer_journey_submissions (id, submitter_id, journey_id, quiz_id, created_at, updated_at, rating, submission_duration)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            submitter_id,
            journey_id,
            quiz_id,
            created_at,
            updated_at,
            rating,
            submission_duration,
          ]
        );
        inserted++;
      } catch (e) {
        console.error("insert error", e.message);
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert journey submissions: inserted=${inserted}, skipped=${skipped}`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importJourneySubmissions };
