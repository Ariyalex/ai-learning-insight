const autoBind = require("auto-bind");
const TrackingService = require("../services/TrackingService");
const { success } = require("../utils/responseFormatter");

class TrackingController {
  constructor() {
    this.trackingService = new TrackingService();
    autoBind(this);
  }

  getTabel = async (req, res) => {
    const result = await this.trackingService.getTrackings();

    const items = (result.items || [])
      .filter((r) => r.completed_at === null)
      .map((r) => ({
        last_viewed: r.last_viewed,
        first_opened_at: r.first_opened_at,
        completed_at: r.completed_at,
      }));

    const filtered = (result.items || [])
      .filter(
        (r) =>
          !(
            r.first_opened_at &&
            r.last_viewed &&
            r.first_opened_at === r.last_viewed
          )
      )
      .map((r) => ({
        id: r.id,
        last_viewed: r.last_viewed,
        first_opened_at: r.first_opened_at,
        completed_at: r.completed_at,
      }));

    return success(res, {
      status: 200,
      message: "Chart data",
      //   data: result,
      data: filtered, // <= hanya 3 field
    });
  };

  getTabelById = async (req, res) => {
    const { id } = req.body;
    console.log(id);
    const row = await this.trackingService.getTrackingById(id);
    if (!row) {
      return res
        .status(404)
        .json({ success: false, status: 404, message: "Tracking not found" });
    }

    const filtered = {
      last_viewed: row.last_viewed,
      first_opened_at: row.first_opened_at,
      completed_at: row.completed_at,
    };

    return success(res, {
      status: 200,
      message: "OK",
      data: filtered,
    });
  };
}

module.exports = TrackingController;
