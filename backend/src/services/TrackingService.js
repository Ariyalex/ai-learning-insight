const autoBind = require("auto-bind");
const TrackingRepository = require("../repositories/TrackingRepository");

class TrackingService {
  constructor() {
    this.trackingRepo = new TrackingRepository();
    autoBind(this);
  }

  async getTrackings(query) {
    return this.trackingRepo.findMany(query);
  }
}

module.exports = TrackingService;
