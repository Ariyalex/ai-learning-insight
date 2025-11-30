const autoBind = require("auto-bind");
const InsightRepository = require("../repositories/InsightRepository");

class InsightService {
  constructor() {
    this.insightRepo = new InsightRepository();
    autoBind(this);
  }

  async getInsights(query) {
    return this.insightRepo.findMany(query);
  }

  async getChartData() {
    return [
      {
        developer_id: "96989",
        first_opened_at: " 2018-08-29",
        last_viewed: "2020-04-08",
        completed_at: "",
      },
      {
        developer_id: "96989",
        first_opened_at: " 2018-08-29",
        last_viewed: "2020-04-08",
        completed_at: "",
      },
      {
        developer_id: "96989",
        first_opened_at: " 2018-08-29",
        last_viewed: "2020-04-08",
        completed_at: "",
      },
    ];
  }
}

module.exports = InsightService;
