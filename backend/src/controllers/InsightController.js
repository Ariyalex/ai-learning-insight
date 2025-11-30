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

  getInsightByUser = async (req, res) => {
    const userId = req.user.id;

    const data = await this.insightService.getInsights({
      userId,
    });

    return success(res, {
      status: 200,
      message: "Insights retrieved successfully",
      data,
    });
  };

  getInsightById = async (req, res) => {
    const { id: insightId } = req.params;
    const userId = req.user.id;
  };
}

module.exports = InsightController;
