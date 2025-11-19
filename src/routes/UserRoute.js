const express = require("express");
const UserController = require("../controllers/UserController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const userController = new UserController();
const userRouter = express.Router();

userRouter.get("/me", auth, asyncHandler(userController.getMe));

module.exports = userRouter;
