const autoBind = require("auto-bind");
const TrackingService = require("../services/TrackingService");
const { success } = require("../utils/responseFormatter");

class TrackingController {
  constructor() {
    this.trackingService = new TrackingService();
    autoBind(this);
  }

  getTabel = async (req, res) => {
    // ambil id user dari token; fallback ke query kalau perlu
    const devId = Number(
      req.user?.id ?? req.query.developer_id ?? req.query.developerId
    );

    if (!Number.isFinite(devId)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "developer_id tidak valid",
      });
    }

    // paksa filter ke repository
    const result = await this.trackingService.getTrackings({
      developerId: devId,
    });

    const formatted = (result.items || []).map((item) => ({
      start_date: item.start_date,
      end_date: item.end_date,
      total: Number(item.total),
    }));

    return success(res, {
      status: 200,
      message: "OK",
      data: formatted,
    });
  };
}

module.exports = TrackingController;
