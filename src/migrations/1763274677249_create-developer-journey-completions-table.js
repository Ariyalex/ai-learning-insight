/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("developer_journey_completions", {
    id: {
      type: "serial",
      primaryKey: "true",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    journey_id: {
      type: "integer",
      notNull: true,
      references: "developer_journeys(id)",
      onDelete: "NO ACTION",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
    },
    enrolling_times: {
      type: "integer",
      notNull: true,
    },
    enrollments_at: {
      type: "text",
      notNull: true,
    },
    last_enrolled_at: {
      type: "timestamptz",
    },
    study_duration: {
      type: "integer",
    },
    avg_submission_rating: {
      type: "numeric(3,2)",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("developer_journey_completions");
};
