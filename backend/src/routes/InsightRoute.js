const express = require("express");
const InsightController = require("../controllers/InsightController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const controller = new InsightController();

router.get("/insight", auth, asyncHandler(controller.getInsight));
router.get("/insight/process", auth, asyncHandler(controller.processInsight));
module.exports = router;
