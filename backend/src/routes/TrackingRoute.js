const express = require("express");
const TrackingController = require("../controllers/TrackingController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const controller = new TrackingController();

router.get("/chart", auth, asyncHandler(controller.getTabel));
module.exports = router;
