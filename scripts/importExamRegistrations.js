const fs = require("fs");
const { parse } = require("csv-parse");
const bcrypt = require("bcryptjs");

/**
 * Import users from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importExamRegistrations(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    // preload existing parent ids to avoid FK errors
    const [tutorialsRes, usersRes] = await Promise.all([
      client.query("SELECT id FROM developer_journey_tutorials"),
      client.query("SELECT id FROM users"),
    ]);
    const existingTutorialIds = new Set(
      tutorialsRes.rows.map((r) => String(r.id))
    );
    const existingUserIds = new Set(usersRes.rows.map((r) => String(r.id)));

    const parseNullableInt = (value) => {
      const raw = (value || "").toString().replace(/[, ]+/g, "").trim();
      if (raw === "") return null;
      const n = parseInt(raw, 10);
      return Number.isNaN(n) ? null : n;
    };

    const parseNullableTimestamp = (value) => {
      const raw = (value || "").toString().trim();
      if (raw === "") return null;
      let t = Date.parse(raw);
      if (Number.isNaN(t)) {
        const alt = raw.replace(/,\s*/g, " ");
        t = Date.parse(alt);
      }
      if (Number.isNaN(t)) return null;
      return new Date(t).toISOString();
    };

    let inserted = 0,
      skipped = 0,
      rowIndex = 0;
    for await (const row of parser) {
      rowIndex++;
      const id = parseNullableInt(row.id);
      const tutorial_id = parseNullableInt(row.tutorial_id);
      const examinees_id = parseNullableInt(row.examinees_id);

      // skip if parent missing
      if (
        tutorial_id !== null &&
        !existingTutorialIds.has(String(tutorial_id))
      ) {
        console.error(
          `skip row=${rowIndex} id=${row.id} reason=missing_tutorial tutorial_id=${row.tutorial_id}`
        );
        skipped++;
        continue;
      }
      if (examinees_id !== null && !existingUserIds.has(String(examinees_id))) {
        console.error(
          `skip row=${rowIndex} id=${row.id} reason=missing_user examinees_id=${row.examinees_id}`
        );
        skipped++;
        continue;
      }

      // parse timestamps; provide safe fallback for NOT NULL columns
      const created_at =
        parseNullableTimestamp(row.created_at) || new Date().toISOString();
      const updated_at = parseNullableTimestamp(row.updated_at) || created_at;
      const deadline_at = parseNullableTimestamp(row.deadline_at) || created_at;
      const exam_finished_at =
        parseNullableTimestamp(row.exam_finished_at) || created_at;
      const deleted_at = parseNullableTimestamp(row.deleted_at); // nullable

      try {
        await client.query("SAVEPOINT sp_row");
        await client.query(
          `INSERT INTO exam_registrations
            (id, tutorial_id, examinees_id, created_at, updated_at, deadline_at, exam_finished_at, deleted_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            tutorial_id,
            examinees_id,
            created_at,
            updated_at,
            deadline_at,
            exam_finished_at,
            deleted_at,
          ]
        );
        await client.query("RELEASE SAVEPOINT sp_row");
        inserted++;
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT sp_row");
        console.error(
          `insert error row=${rowIndex} id=${
            row.id
          } tutorial_id=${tutorial_id} examinees_id=${examinees_id} constraint=${
            e.constraint || "N/A"
          } message=${e.message}`
        );
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert exam registrations: inserted=${inserted}, skipped=${skipped}`
    );
    return { inserted, skipped };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importExamRegistrations };
