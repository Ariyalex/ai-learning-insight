/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("exam_registrations", {
    id: {
      type: "serial",
      primaryKey: "true",
    },
    tutorial_id: {
      type: "integer",
      notNull: true,
      references: "developer_journey_tutorials(id)",
      onDelete: "NO ACTION",
    },
    examinees_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
    },
    deadline_at: {
      type: "timestamptz",
      notNull: true,
    },
    exam_finished_at: {
      type: "timestamptz",
      notNull: true,
    },
    deleted_at: {
      type: "timestamptz",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("exam_registrations");
};
