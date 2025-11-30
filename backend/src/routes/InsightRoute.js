const express = require("express");
const InsightController = require("../controllers/InsightController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const controller = new InsightController();

router.get("/insight", auth, asyncHandler(controller.getInsight));
router.get("/insight/process", auth, asyncHandler(controller.processInsight));
router.get("/insight/chart", auth, asyncHandler(controller.getTabel));
module.exports = router;
