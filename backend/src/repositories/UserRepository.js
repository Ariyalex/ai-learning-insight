const autoBind = require("auto-bind");

class UserRepository {
  constructor() {
    this.db = require("../db");

    autoBind(this);
  }

  async findByEmailWithPassword(email) {
    const { rows } = await this.db.query(
      "select id, password, name, email from users where email = $1 limit 1",
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await this.db.query(
      "select id, name, email, created_at, updated_at from users where id = $1 limit 1",
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = UserRepository;
