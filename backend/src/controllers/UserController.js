const autoBind = require("auto-bind");
const UserService = require("../services/UserService");
const { success } = require("../utils/responseFormatter");

class UserController {
  constructor() {
    this.userService = new UserService();

    autoBind(this);
  }

  getMe = async (req, res) => {
    const user = await this.userService.getUserById(req.user.id);

    return success(res, {
      status: 200,
      message: "User retrived successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  };
}

module.exports = UserController;
