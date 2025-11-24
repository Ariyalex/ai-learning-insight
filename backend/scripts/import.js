const { Pool } = require("pg");
const { importUsers } = require("./importUsers");
const { importJourney } = require("./importJourneys");
const { importJourneyTutorials } = require("./importJourneyTutorials");
const { importJourneyTrackings } = require("./importJourneyTrackings");
const { importJourneyCompletions } = require("./importJourneyCompletions");
const { importJourneySubmissions } = require("./importJourneySubmissions");
const { importExamRegistrations } = require("./importExamRegistrations");
const { importExamResults } = require("./importExamResults");

const usersCsvPath = "./.csv_data/users.csv";
const journeyPath = "./.csv_data/developer_journeys.csv";
const tutorialsPath = "./.csv_data/developer_journey_tutorials.csv";
const trackingPath = "./.csv_data/developer_journey_trackings.csv";
const completionsPath = "./.csv_data/developer_journey_completions.csv";
const submissionsPath = "./.csv_data/developer_journey_submissions.csv";
const examRegistrationsPath = "./.csv_data/exam_registrations.csv";
const examResultsPath = "./.csv_data/exam_results.csv";

const imports = [
  { fn: importUsers, csv: usersCsvPath, table: "users" },
  { fn: importJourney, csv: journeyPath, table: "developer_journeys" },
  {
    fn: importJourneyTutorials,
    csv: tutorialsPath,
    table: "developer_journey_tutorials",
  },
  {
    fn: importJourneyTrackings,
    csv: trackingPath,
    table: "developer_journey_trackings",
  },
  {
    fn: importJourneyCompletions,
    csv: completionsPath,
    table: "developer_journey_completions",
  },
  {
    fn: importJourneySubmissions,
    csv: submissionsPath,
    table: "developer_journey_submissions",
  },
  {
    fn: importExamRegistrations,
    csv: examRegistrationsPath,
    table: "exam_registrations",
  },
  { fn: importExamResults, csv: examResultsPath, table: "exam_results" },
];

(async () => {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  try {
    // Check users table only: if users has data -> skip all imports
    const usersCountRes = await pool.query("SELECT COUNT(*) AS c FROM users");
    const usersCount = parseInt(usersCountRes.rows[0].c || 0, 10);
    if (usersCount > 0) {
      console.log(
        `Users table not empty (${usersCount} rows). Skipping all imports.`
      );
      process.exit(0);
    }

    // proceed with per-table check & import (idempotent per table)
    for (const item of imports) {
      const { rows } = await pool.query(
        `SELECT COUNT(*) AS c FROM ${item.table}`
      );
      const count = parseInt(rows[0].c || 0, 10);
      if (count > 0) {
        console.log(
          `Skip import for ${item.table} — table not empty (${count} rows)`
        );
        continue;
      }
      console.log(`Importing ${item.table} from: ${item.csv}`);
      await item.fn(item.csv, pool);
    }

    console.log("All imports finished.");
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
