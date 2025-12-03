const autoBind = require("auto-bind");
const TrackingRepository = require("../repositories/TrackingRepository");

class TrackingService {
  constructor() {
    this.trackingRepo = new TrackingRepository();
    autoBind(this);
  }

  async getTabel({ developerId }) {
    if (!Number.isFinite(Number(developerId))) {
      throw new Error("developerId is required");
    }
    return this.trackingRepo.getTabel({ developerId: Number(developerId) });
  }
}

module.exports = TrackingService;
