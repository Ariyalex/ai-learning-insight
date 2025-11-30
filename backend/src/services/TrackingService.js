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

  async getTrackingById(id) {
    return this.trackingRepo.findById(id);
  }
}

module.exports = TrackingService;
