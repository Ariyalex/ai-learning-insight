const fs = require("fs");
const { parse } = require("csv-parse");

/**
 * Import journey trackings from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importJourneyTrackings(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    // preload existing parent ids to avoid FK errors
    const [journeysRes, tutorialsRes, usersRes] = await Promise.all([
      client.query("SELECT id FROM developer_journeys"),
      client.query("SELECT id FROM developer_journey_tutorials"),
      client.query("SELECT id FROM users"),
    ]);
    const existingJourneyIds = new Set(
      journeysRes.rows.map((r) => String(r.id))
    );
    const existingTutorialIds = new Set(
      tutorialsRes.rows.map((r) => String(r.id))
    );
    const existingUserIds = new Set(usersRes.rows.map((r) => String(r.id)));

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
      let t = Date.parse(raw);
      if (Number.isNaN(t)) {
        const alt = raw.replace(/,\s*/g, " ");
        t = Date.parse(alt);
      }
      if (Number.isNaN(t)) return null;
      return new Date(t).toISOString();
    };

    for await (const row of parser) {
      rowIndex++;
      const id = parseNullableInt(row.id);
      const journey_id = parseNullableInt(row.journey_id);
      const tutorial_id = parseNullableInt(row.tutorial_id);
      const developer_id = parseNullableInt(row.developer_id);

      // validate parent existence, skip if missing
      if (journey_id !== null && !existingJourneyIds.has(String(journey_id))) {
        console.error(
          `skip row=${rowIndex} id=${row.id} reason=missing_journey journey_id=${row.journey_id}`
        );
        skipped++;
        continue;
      }
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
      if (developer_id !== null && !existingUserIds.has(String(developer_id))) {
        console.error(
          `skip row=${rowIndex} id=${row.id} reason=missing_user developer_id=${row.developer_id}`
        );
        skipped++;
        continue;
      }

      const last_viewed = parseNullableTimestamp(row.last_viewed);
      const first_opened_at = parseNullableTimestamp(row.first_opened_at);
      const completed_at = parseNullableTimestamp(row.completed_at);

      // SKIP jika last_viewed null/empty (sesuai permintaan)
      if (last_viewed === null) {
        console.error(
          `skip row=${rowIndex} id=${
            row.id
          } reason=missing_last_viewed last_viewed_raw=${JSON.stringify(
            row.last_viewed
          )}`
        );
        skipped++;
        continue;
      }

      try {
        // per-row savepoint so one bad insert won't abort whole transaction
        await client.query("SAVEPOINT sp_row");
        await client.query(
          `INSERT INTO developer_journey_trackings
            (id, journey_id, tutorial_id, developer_id, last_viewed, first_opened_at, completed_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            journey_id,
            tutorial_id,
            developer_id,
            last_viewed,
            first_opened_at,
            completed_at,
          ]
        );
        await client.query("RELEASE SAVEPOINT sp_row");
        inserted++;
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT sp_row");
        console.error(
          `insert error row=${rowIndex} id=${row.id} parsed_journey_id=${journey_id} parsed_tutorial_id=${tutorial_id} parsed_dev_id=${developer_id} msg=${e.message}`
        );
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert journey trackings: inserted=${inserted}, skipped=${skipped}`
    );
    return { inserted, skipped };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importJourneyTrackings };
