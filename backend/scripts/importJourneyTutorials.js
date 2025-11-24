const fs = require("fs");
const { parse } = require("csv-parse");

/**
 * Import users from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importJourneyTutorials(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    // preload existing developer_journeys ids to avoid FK errors
    const res = await client.query("SELECT id FROM developer_journeys");
    const existingJourneyIds = new Set(res.rows.map((r) => String(r.id)));

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
      const developer_journey_id = parseNullableInt(row.developer_journey_id);

      // debug: show raw values for problematic rows
      if (
        developer_journey_id !== null &&
        !existingJourneyIds.has(String(developer_journey_id))
      ) {
        console.error(
          `skip row=${rowIndex} id=${row.id} raw_dev_journey_id=${row.developer_journey_id} -> NOT FOUND in developer_journeys`
        );
        skipped++;
        continue;
      }

      const title = (row.title || "").trim();
      const type = (row.type || "").trim();
      const position = parseNullableInt(row.position);
      const created_at = parseNullableTimestamp(row.created_at);
      const updated_at = parseNullableTimestamp(row.updated_at);

      try {
        // per-row savepoint so one bad insert doesn't abort whole transaction
        await client.query(`SAVEPOINT sp_row_${rowIndex}`);
        await client.query(
          `INSERT INTO developer_journey_tutorials (id, developer_journey_id, title, type, position, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            developer_journey_id,
            title,
            type,
            position,
            created_at,
            updated_at,
          ]
        );
        await client.query(`RELEASE SAVEPOINT sp_row_${rowIndex}`);
        inserted++;
      } catch (e) {
        await client.query(`ROLLBACK TO SAVEPOINT sp_row_${rowIndex}`);
        // better error info for FK/PK issues
        console.error(
          `insert error row=${rowIndex} id=${row.id} raw_dev_journey_id=${
            row.developer_journey_id
          } parsed_dev_journey_id=${developer_journey_id} constraint=${
            e.constraint || "N/A"
          } message=${e.message}`
        );
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert journey tutorials: inserted=${inserted}, skipped=${skipped}`
    );
    return { inserted, skipped };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importJourneyTutorials };
