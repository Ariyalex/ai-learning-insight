/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("insights", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    total_materials_opened: {
      type: "integer",
      notNull: true,
    },
    total_active_days: {
      type: "integer",
      notNull: true,
    },
    total_completed: {
      type: "integer",
    },
    avg_submission_rating: {
      type: "numeric(20,14)",
    },
    avg_submission_duration: {
      type: "numeric(20,14)",
    },
    total_study_duration: {
      type: "integer",
    },
    avg_completion_rating: {
      type: "numeric(20,14)",
    },
    avg_exam_score: {
      type: "numeric(20,14)",
    },
    exam_pass_rate: {
      type: "numeric(20,14)",
    },
    exam_count: {
      type: "integer",
    },
    cluster: {
      type: "integer",
      notNull: true,
    },
    cluster_label: {
      type: "varchar(100)",
      notNull: true,
    },
    activity_score: {
      type: "numeric(20,14)",
    },
    academic_score: {
      type: "numeric(20,14)",
    },
    activity_insight: {
      type: "varchar(255)",
      notNull: true,
    },
    academic_insight: {
      type: "varchar(255)",
      notNull: true,
    },
    academic_insight_k: {
      type: "text",
    },
    activity_insight_k: {
      type: "text",
    },
    cluster_label_k: {
      type: "text",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("insights");
};
