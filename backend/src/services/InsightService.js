const autoBind = require("auto-bind");
const InsightRepository = require("../repositories/InsightRepository");

class InsightService {
  constructor() {
    this.insightRepo = new InsightRepository();
    autoBind(this);
  }

  async getInsight(query) {
    return this.insightRepo.getInsight(query);
  }

  async getInsightById(insightId) {
    return this.insightRepo.getInsightByid(insightId);
  }

  async getAllInsights({ userId }) {
    return this.insightRepo.getAllInsightsByUser({ userId });
  }
}

module.exports = InsightService;
