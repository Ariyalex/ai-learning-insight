const express = require("express");
const AuthController = require("../controllers/authController");
const validator = require("../middlewares/validator");

const {
  loginPayloadSchema,
  refreshTokenPayloadSchema,
  logoutPayloadSchema,
} = require("../validator/AuthValidator");
const asyncHandler = require("../utils/asyncHandler");

const authController = new AuthController();
const authRouter = express.Router();

authRouter.post(
  "/login",
  validator(loginPayloadSchema),
  asyncHandler(authController.login)
);
authRouter.post(
  "/refresh",
  validator(refreshTokenPayloadSchema),
  asyncHandler(authController.refresh)
);
authRouter.post(
  "/logout",
  validator(logoutPayloadSchema),
  asyncHandler(authController.logout)
);

module.exports = authRouter;
