/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("developer_journey_tutorials", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    developer_journey_id: {
      type: "integer",
      notNull: true,
      references: "developer_journeys(id)",
      onDelete: "NO ACTION",
    },
    title: {
      type: "text",
    },
    type: {
      type: "varchar(50)",
    },
    position: {
      type: "integer",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("developer_journey_tutorials");
};
