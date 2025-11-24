const autoBind = require("auto-bind");
const NotFoundError = require("../exceptions/NotFoundError");
const UserRepository = require("../repositories/UserRepository");

class UserService {
  constructor() {
    this.userRepo = new UserRepository();

    autoBind(this);
  }

  async getUserById(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

module.exports = UserService;
