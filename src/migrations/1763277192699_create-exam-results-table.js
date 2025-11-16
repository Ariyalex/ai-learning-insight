/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("exam_results", {
    id: {
      type: "serial",
      primaryKey: "true",
    },
    exam_registration_id: {
      type: "integer",
      notNull: true,
      references: "exam_registrations(id)",
      onDelete: "CASCADE",
    },
    total_question: {
      type: "integer",
      notNull: true,
    },
    score: {
      type: "integer",
      notNull: true,
    },
    is_passed: {
      type: "integer",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
