const { PgLiteral } = require('node-pg-migrate');
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('face_verification_steps', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: new PgLiteral('gen_random_uuid()'),
      notNull: true
    },
    step: { type: 'integer', notNull: true },
    descriptor: { type: 'bytea', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    api_key: { type: 'text', notNull: true }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('face_verification_steps');
};
