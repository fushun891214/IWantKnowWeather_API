import CWAApiService from "../services/CWAApiService.js";

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
        message: "CWA 預報資料獲取並儲存成功",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "獲取 CWA 預報資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default cwaController;
