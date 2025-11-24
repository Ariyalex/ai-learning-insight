const fs = require("fs");
const { parse } = require("csv-parse");
const bcrypt = require("bcryptjs");

/**
 * Import users from CSV into DB.
 * @param {string} csvPath - path to csv
 * @param {import('pg').Pool} pool - pg Pool instance (required)
 * @returns {Promise<{inserted:number, skipped:number}>}
 */
async function importUsers(csvPath, pool) {
  if (!pool) throw new Error("pool is required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const parser = fs
      .createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }));

    let inserted = 0,
      skipped = 0;

    for await (const row of parser) {
      const id = (() => {
        const raw = (row.id || "").replace(/,/g, "").trim();
        if (raw === "") return null;
        const n = parseInt(raw, 10);
        return Number.isNaN(n) ? null : n;
      })();
      const name = row.name.trim() || null;
      const email = (row.email || "").trim();
      if (!email) {
        skipped++;
        continue;
      }
      const createdAt = row.created_at.trim();
      const updatedAt = row.updated_at.trim();

      const rawPassword = (row.display_name || "").trim();
      const passwordHash = await bcrypt.hash(rawPassword, 10);

      try {
        await client.query(
          `INSERT INTO users (id, name, email, password, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO NOTHING`,
          [id, name, email, passwordHash, createdAt, updatedAt]
        );
        inserted++;
      } catch (e) {
        console.error("insert error", email, e.message);
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Finished insert users: inserted=${inserted}, skipped=${skipped}`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { importUsers };
