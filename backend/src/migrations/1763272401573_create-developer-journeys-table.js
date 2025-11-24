/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("developer_journeys", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "text",
      notNull: true,
    },
    point: {
      type: "integer",
    },
    required_point: {
      type: "integer",
    },
    xp: {
      type: "integer",
    },
    required_xp: {
      type: "integer",
    },
    difficulty: {
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
    deadline: {
      type: "integer",
    },
    hours_to_study: {
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
  pgm.dropTable("developer_journeys");
};
