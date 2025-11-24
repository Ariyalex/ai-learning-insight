const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_KEY;
const ACCESS_TOKEN_AGE = parseInt(process.env.ACCESS_TOKEN_AGE, 10) || 1800;
const REFRESH_TOKEN_AGE_DAYS =
  parseInt(process.env.REFRESH_TOKEN_AGE, 10) || 30;

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_AGE });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_AGE_DAYS * 24 * 60 * 60 * 1000);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiresAt,
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE_DAYS,
};
