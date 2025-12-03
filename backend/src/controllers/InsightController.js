const axios = require("axios");
const autoBind = require("auto-bind");
const InsightService = require("../services/InsightService");
const { success, error } = require("../utils/responseFormatter");

class InsightController {
  constructor() {
    this.insightService = new InsightService();
    autoBind(this);
  }

  processInsight = async (req, res) => {
    try {
      const developerId = req.user.id;

      const payload = { developer_id: developerId };
      await axios.post(`http://ml:8000/proses/insight`, payload);

      return success(res, {
        status: 200,
        message: "Insight processed successfully",
      });
    } catch (err) {
      console.log(err);
      return error(res, {
        status: 502,
        message: err.message,
      });
    }
  };

  getInsightByUser = async (req, res) => {
    const userId = req.user.id;
    const row = await this.insightService.getInsight({ userId });

    const {
      id,
      user_id,
      cluster_label,
      activity_insight,
      academic_insight,
      academic_insight_k,
      activity_insight_k,
      cluster_label_k,
      created_at,
    } = row;

    return success(res, {
      status: 200,
      message: "Insights retrieved successfully",
      data: {
        id,
        user_id,
        cluster_label,
        activity_insight,
        academic_insight,
        academic_insight_k,
        activity_insight_k,
        cluster_label_k,
        created_at,
      },
    });
  };

  getAllInsights = async (req, res) => {
    const userId = req.user.id;
    const rows = await this.insightService.getAllInsights({ userId });

    const data = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      cluster_label: r.cluster_label,
      activity_insight: r.activity_insight,
      academic_insight: r.academic_insight,
      academic_insight_k: r.academic_insight_k,
      activity_insight_k: r.activity_insight_k,
      cluster_label_k: r.cluster_label_k,
      created_at: r.created_at,
    }));

    return success(res, {
      status: 200,
      message: "Insights retrieved successfully",
      data,
    });
  };

  getInsightById = async (req, res) => {
    const { id: insightId } = req.params;
    const userId = req.user.id;

    const data = await this.insightService.getInsightById(insightId);

    if (data.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insight ini bukan milik Anda",
      });
    }

    const filtered = {
      id: data.id,
      user_id: data.user_id,
      cluster_label: data.cluster_label,
      activity_insight: data.activity_insight,
      academic_insight: data.academic_insight,
      academic_insight_k: data.academic_insight_k,
      activity_insight_k: data.activity_insight_k,
      cluster_label_k: data.cluster_label_k,
      created_at: data.created_at,
    };

    return success(res, {
      status: 200,
      message: "Insight retrieved successfully",
      data: filtered,
    });
  };
}

module.exports = InsightController;
