class AuthenticationRepository {
  constructor() {
    this.db = require("../db");
  }

  async create({ userId, tokenHash, expiresAt }) {
    const { rows } = await this.db.query(
      `insert into authentications (user_id, token, expires_at, revoked, created_at, updated_at)
        values ($1, $2, $3, false, now(), now())`,
      [userId, tokenHash, expiresAt]
    );

    return rows[0];
  }

  async findByToken(tokenHash) {
    const { rows } = await this.db.query(
      `select id, user_id, expires_at, revoked from authentications
                where token = $1 limit 1`,
      [tokenHash]
    );

    return rows[0] || null;
  }

  async revokeById(id) {
    await this.db.query(
      `update authentications set revoked = true, revoked_at = now(), updated_at = now() where id = $1`,
      [id]
    );
  }

  async revokeByToken(tokenHash) {
    await this.db.query(
      `update authentications set revoked = true, revoked_at = now(), updated_at = now() where token = $1`,
      [tokenHash]
    );
  }

  async deleteExpired() {
    await this.db.query(
      "delete from authentications where expires_at is not null and expires_at < now()"
    );
  }
}

module.exports = AuthenticationRepository;
