/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("developer_journey_trackings", {
    id: {
      type: "serial",
      primaryKey: "true",
    },
    journey_id: {
      type: "integer",
      notNull: true,
      references: "developer_journeys(id)",
      onDelete: "NO ACTION",
    },
    tutorial_id: {
      type: "integer",
      notNull: true,
      references: "developer_journey_tutorials(id)",
      onDelete: "NO ACTION",
    },
    developer_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    last_viewed: {
      type: "timestamptz",
      notNull: true,
    },
    first_opened_at: {
      type: "timestamptz",
    },
    completed_at: {
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
  pgm.dropTable("developer_journey_trackings");
};
