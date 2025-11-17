const express = require("express");
const AuthController = require("../controllers/authController");
const validator = require("../middlewares/validator");

const {
  loginPayloadSchema,
  refreshTokenPayloadSchema,
  logoutPayloadSchema,
} = require("../validator/AuthValidator");

const authController = new AuthController();
const authRouter = express.Router();

authRouter.post("/login", validator(loginPayloadSchema), authController.login);
authRouter.post(
  "/refresh",
  validator(refreshTokenPayloadSchema),
  authController.refresh
);
authRouter.post(
  "/logout",
  validator(logoutPayloadSchema),
  authController.logout
);

module.exports = authRouter;
