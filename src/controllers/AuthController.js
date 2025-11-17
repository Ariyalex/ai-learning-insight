const autoBind = require("auto-bind");
const AuthService = require("../services/authService");
const InvariantError = require("../exceptions/InvariantError");
const { success } = require("../utils/responseFormatter");

class AuthController {
  constructor() {
    this.authService = new AuthService();

    autoBind(this);
  }

  login = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      throw new InvariantError("Email and password required");

    const user = await this.authService.authenticateUser(email, password);
    if (!user) throw new InvariantError("Invalid credentials");

    const { accessToken, refreshToken } =
      await this.authService.createSessionForUser(user.id);

    return success(res, {
      status: 200,
      message: "Login berhasil!",
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  };

  refresh = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) throw new InvariantError("Refresh token required");

    const { accessToken, refreshToken: newRefresh } =
      await this.authService.refreshSession(refreshToken);

    return success(res, {
      status: 200,
      message: "Refresh access token berhasil!",
      data: {
        accessToken,
        refreshToken: newRefresh,
      },
    });
  };

  logout = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) throw new InvariantError("Refresh token required");

    await this.authService.revokeRefreshToken(refreshToken);

    return success(res, {
      status: 200,
      message: "Logged Out",
    });
  };
}

module.exports = AuthController;
