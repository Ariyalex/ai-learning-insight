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

(async () => {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  try {
    console.log("Importing users from:", usersCsvPath);
    await importUsers(usersCsvPath, pool);
    await importJourney(journeyPath, pool);
    await importJourneyTutorials(tutorialsPath, pool);
    await importJourneyTrackings(trackingPath, pool);
    await importJourneyCompletions(completionsPath, pool);
    await importJourneySubmissions(submissionsPath, pool);
    await importExamRegistrations(examRegistrationsPath, pool);
    await importExamResults(examResultsPath, pool);

    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
