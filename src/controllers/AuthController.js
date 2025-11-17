const AuthService = require("../services/authService");

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  login = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    try {
      const user = await this.authService.authenticateUser(email, password);
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const { accessToken, refreshToken } =
        await this.authService.createSessionForUser(user.id);

      return res.json({
        success: true,
        status: 200,
        message: "Login berhasil!",
        data: {
          accessToken,
          refreshToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  refresh = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    try {
      const { accessToken, refreshToken: newRefresh } =
        await this.authService.refreshSession(refreshToken);

      return res.json({
        success: true,
        status: 200,
        message: "Refresh access token berhasil!",
        data: {
          accessToken,
          refreshToken: newRefresh,
        },
      });
    } catch (error) {
      if (
        error.message === "invalid_refresh" ||
        error.message === "revoked_refresh" ||
        error.message === "expired_refresh"
      ) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  logout = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    try {
      const response = await this.authService.revokeRefreshToken(refreshToken);
      if (!response) {
        return res.status(410).json({
          success: false,
          status: 410,
          message: "Refresh token sudah dicabut",
        });
      }
      return res.json({
        success: true,
        status: 200,
        message: "Logged Out",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = AuthController;
