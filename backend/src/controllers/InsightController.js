const autoBind = require("auto-bind");
const InsightService = require("../services/InsightService");
const { success } = require("../utils/responseFormatter");

class InsightController {
  constructor() {
    this.insightService = new InsightService();
    autoBind(this);
  }

  // processInsight = async (req, res) => {
  //   // Base URL ML service
  //   const baseUrl = (
  //     process.env.ML_BASE_URL || "http://localhost:8000"
  //   ).replace(/\/$/, "");
  //   const url = `${baseUrl}/process/`;

  //   // Ambil query param dari FE
  //   const queryParams = new URLSearchParams();

  //   for (const [key, value] of Object.entries(req.query || {})) {
  //     if (
  //       value !== undefined &&
  //       value !== null &&
  //       String(value).trim() !== ""
  //     ) {
  //       queryParams.append(key, value);
  //     }
  //   }

  //   // Bentuk final GET URL
  //   const finalUrl = `${url}?${queryParams.toString()}`;

  //   try {
  //     const controller = new AbortController();
  //     const timeoutMs = Number(process.env.ML_TIMEOUT_MS) || 10000;
  //     const t = setTimeout(() => controller.abort(), timeoutMs);

  //     const resp = await fetch(finalUrl, {
  //       method: "GET",
  //       signal: controller.signal,
  //     }).finally(() => clearTimeout(t));

  //     const raw = await resp.text();
  //     let data;
  //     try {
  //       data = JSON.parse(raw);
  //     } catch {
  //       data = { raw };
  //     }

  //     // if (!resp.ok) {
  //     //   return res.status(502).json({
  //     //     success: false,
  //     //     status: 502,
  //     //     message: "ML service error",
  //     //     detail: data,
  //     //   });
  //     // }

  //     return success(res, {
  //       status: 200,
  //       message: "process insight success",
  //       data,
  //     });
  //   } catch (err) {
  //     const isAbort = err?.name === "AbortError";
  //     return res.status(isAbort ? 504 : 500).json({
  //       success: false,
  //       status: isAbort ? 504 : 500,
  //       message: isAbort ? "ML service timeout" : "Failed to process insight",
  //       error: String(err?.message || err),
  //     });
  //   }
  // };

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
