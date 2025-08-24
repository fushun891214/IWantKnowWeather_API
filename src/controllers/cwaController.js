import CWAApiService from "../services/cwaApiService.js";
import { API_STATUS } from "../util/apiStatus.js";

class cwaControllerBase {
  constructor() {
    this.cwaService = new CWAApiService();
  }
}

class cwaController extends cwaControllerBase {
  /**
   * 從 CWA API 獲取預報資料並寫入 forecast 集合
   * GET /api/cwa/forecast?location={cityName}
   */
  async getForecast(req, res) {
    try {
      const { location } = req.query;

      const result = await this.cwaService.getWeatherForecast(location);

      res.status(200).json({
        success: true,
        status: API_STATUS.success,
        data: result,
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

  async getForecastAll(req, res) {
    try {
      const result = await this.cwaService.getWeatherForecastAll();

      res.status(200).json({
        success: true,
        status: API_STATUS.success,
        data: result,
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

export default cwaController;
