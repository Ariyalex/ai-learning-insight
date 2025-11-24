/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("developer_journey_submissions", {
    id: {
      type: "serial",
      primaryKey: "true",
    },
    submitter_id: {
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
    quiz_id: {
      type: "integer",
      notNull: true,
      references: "developer_journey_tutorials(id)",
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
    rating: {
      type: "integer",
    },
    submission_duration: {
      type: "integer",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("developer_journey_submissions");
};
