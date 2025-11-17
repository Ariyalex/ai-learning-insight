const bcrypt = require("bcryptjs");
const AuthenticationRepository = require("../repositories/AuthenticationRepository");
const UserRepository = require("../repositories/UserRepository");

const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  refreshExpiresAt,
} = require("../tokenize/TokenManager");
const autoBind = require("auto-bind");
const InvariantError = require("../exceptions/InvariantError");
const AuthenticationError = require("../exceptions/AuthenticationError");

class AuthService {
  constructor() {
    this.authRepo = new AuthenticationRepository();
    this.userRepo = new UserRepository();

    autoBind(this);
  }

  async authenticateUser(email, password) {
    const user = await this.userRepo.findByEmailWithPassword(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? { id: user.id, name: user.name, email: user.email } : null;
  }

  async createSessionForUser(userId) {
    const accessToken = generateAccessToken({ userId });
    const refreshToken = generateRefreshToken();
    const refreshHash = hashToken(refreshToken);
    const expiresAt = refreshExpiresAt();

    await this.authRepo.create({ userId, tokenHash: refreshHash, expiresAt });

    return { accessToken, refreshToken };
  }

  async refreshSession(refreshToken) {
    const refreshHash = hashToken(refreshToken);

    const record = await this.authRepo.findByToken(refreshHash);

    if (!record) throw new AuthenticationError("Invalid refresh token");
    if (record.revoked) throw new AuthenticationError("Refresh token revoked");
    if (record.expires_at && new Date(record.expires_at) < new Date())
      throw new AuthenticationError("Refresh token expired");

    await this.authRepo.revokeById(record.id);

    const newRefreshToken = generateRefreshToken();
    const newRefreshHash = hashToken(newRefreshToken);
    const newExpiresAt = refreshExpiresAt();

    await this.authRepo.create({
      userId: record.user_id,
      tokenHash: newRefreshHash,
      expiresAt: newExpiresAt,
    });

    const accessToken = generateAccessToken({ userId: record.user_id });
    return {
      accessToken,
      refreshToken: newRefreshToken,
      userId: record.user_id,
    };
  }

  async revokeRefreshToken(refreshToken) {
    const refreshHash = hashToken(refreshToken);
    const record = await this.authRepo.findByToken(refreshHash);

    if (!record) throw new InvariantError("Refresh token not found");
    if (record.revoked)
      throw new InvariantError("Refresh token alredy revoked");
    await this.authRepo.revokeByToken(refreshHash);
  }
}

module.exports = AuthService;
