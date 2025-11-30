const express = require("express");
const InsightController = require("../controllers/InsightController");
const auth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const insightRouter = express.Router();
const controller = new InsightController();

insightRouter.get("/", auth, asyncHandler(controller.getInsightByUser));
insightRouter.get("/process", auth, asyncHandler(controller.processInsight));
insightRouter.get("/:id", auth);

module.exports = insightRouter;
