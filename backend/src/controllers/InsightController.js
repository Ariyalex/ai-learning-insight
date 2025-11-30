const autoBind = require("auto-bind");
const InsightService = require("../services/InsightService");
const { success } = require("../utils/responseFormatter");

class InsightController {
  constructor() {
    this.insightService = new InsightService();
    autoBind(this);
  }

  processInsight = async (req, res) => {
    return success(res, {
      status: 200,
      message: "success",
    });
  };

  getInsight = async (req, res) => {
    const {
      user_id: userIdRaw,
      cluster: clusterRaw,
      limit: limitRaw,
      offset: offsetRaw,
      order: orderRaw,
    } = req.query || {};

    let limit = Number(limitRaw);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (limit > 100) limit = 100;

    let offset = Number(offsetRaw);
    if (!Number.isFinite(offset) || offset < 0) offset = 0;

    const order =
      String(orderRaw || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    const data = await this.insightService.getInsights({
      userId: userIdRaw !== undefined ? Number(userIdRaw) : undefined,
      cluster: clusterRaw !== undefined ? Number(clusterRaw) : undefined,
      limit,
      offset,
      order,
    });

    return success(res, {
      status: 200,
      message: "Insights retrieved successfully",
      data,
      pagination: {
        limit,
        offset,
        count: data.length,
        has_more: data.length === limit,
      },
    });
  };
}

module.exports = InsightController;
