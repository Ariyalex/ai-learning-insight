const autoBind = require("auto-bind");
const TrackingService = require("../services/TrackingService");
const { success } = require("../utils/responseFormatter");
const ClientError = require("../exceptions/ClientError");

class TrackingController {
  constructor() {
    this.trackingService = new TrackingService();
    autoBind(this);
  }

  getTabel = async (req, res) => {
    const devId = Number(
      req.user?.id ?? req.query.developerId ?? req.query.developer_id
    );

    if (!Number.isFinite(devId) || !Number.isInteger(devId) || devId <= 0) {
      throw new ClientError("developer_id tidak valid", 400);
    }

    const { items = [] } = await this.trackingService.getTabel({
      developerId: devId,
    });

    const data = items.map(({ start_date, end_date, total }) => ({
      start_date,
      end_date,
      total: Number(total),
    }));

    return success(res, {
      status: 200,
      message: "OK",
      data,
    });
  };
}

module.exports = TrackingController;
