import dataService from "../services/dataService.js";
import { API_STATUS } from "../util/apiStatus.js";

class controllerBase {
  constructor() {
    this.dataService = new dataService();
  }
}

class dataController extends controllerBase {
  /**
   * 從資料庫查詢特定城市及區域的天氣預報資料
   * GET /api/data/forecast?city={cityName}&district={districtName}
   */
  async getForecast(req, res) {
    try {
      const { city, district } = req.query;

      // 驗證必填參數
      if (!city) {
        return res.status(400).json({
          success: false,
          status: API_STATUS.error,
          error: "city 參數為必填",
          timestamp: new Date().toISOString(),
        });
      }

      // 從資料庫查詢預報資料
      const result = await this.dataService.getForecastFromDB(city, district);

      res.status(200).json({
        success: true,
        status: API_STATUS.success,
        data: result,
        query: { city, district },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: API_STATUS.error,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default dataController;
