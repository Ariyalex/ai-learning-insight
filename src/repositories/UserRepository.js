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
}

module.exports = UserRepository;
