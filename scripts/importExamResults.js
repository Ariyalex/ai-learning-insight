const fs = require("fs");
const { parse } = require("csv-parse");
const bcrypt = require("bcryptjs");

/**
 * Import users from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importExamResults(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    // preload existing exam_registration ids to avoid FK errors
    const res = await client.query("SELECT id FROM exam_registrations");
    const existingExamRegistrationIds = new Set(
      res.rows.map((r) => String(r.id))
    );

    let inserted = 0,
      skipped = 0;
    let rowIndex = 0;

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
      rowIndex++;
      const id = parseNullableInt(row.id);
      const exam_registration_id = parseNullableInt(row.exam_registration_id);
      const total_questions = parseNullableInt(row.total_questions);
      const score = parseNullableInt(row.score);
      const is_passed = parseNullableInt(row.is_passed);
      const created_at = parseNullableTimestamp(row.created_at);

      // FK check: skip if referenced exam_registration not exists
      if (
        exam_registration_id !== null &&
        !existingExamRegistrationIds.has(String(exam_registration_id))
      ) {
        console.error(
          `skip row=${rowIndex} id=${row.id} reason=missing_exam_registration exam_registration_id=${row.exam_registration_id}`
        );
        skipped++;
        continue;
      }

      try {
        // per-row savepoint so one bad insert won't abort whole transaction
        await client.query("SAVEPOINT sp_row");
        await client.query(
          `INSERT INTO exam_results (id, exam_registration_id, total_questions, score, is_passed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            exam_registration_id,
            total_questions,
            score,
            is_passed,
            created_at,
          ]
        );
        await client.query("RELEASE SAVEPOINT sp_row");
        inserted++;
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT sp_row");
        console.error(
          `insert error row=${rowIndex} id=${row.id} exam_registration_id=${exam_registration_id} message=${e.message}`
        );
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert exam results: inserted=${inserted}, skipped=${skipped}`
    );
    return { inserted, skipped };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importExamResults };
