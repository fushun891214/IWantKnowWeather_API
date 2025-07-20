// CWA API 控制器
const cwaApiService = require("../services/cwaApiService");

/**
 * CWA API 控制器
 * 處理與 CWA API 相關的 HTTP 請求
 */
class cwaController {
  constructor() {
    this.cwaService = new cwaApiService();
  }

  /**
   * 獲取天氣預報資料 (從 CWA API)
   * GET /api/CWA/forecast
   */
  // async getForecastFromCWA(req, res) {
  //   try {
  //     const { locationName } = req.query;

  //     console.log(`📡 接收天氣預報請求: ${locationName || "全部地區"}`);

  //     const cwaData = await this.cwaService.getWeatherForecast(locationName);

  //     res.status(200).json({
  //       success: true,
  //       message: "天氣預報資料獲取成功",
  //       data: cwaData,
  //       timestamp: new Date().toISOString(),
  //     });
  //   } catch (error) {
  //     console.error("獲取天氣預報失敗:", error);

  //     res.status(500).json({
  //       success: false,
  //       message: "獲取天氣預報失敗",
  //       error: error.message,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }

  /**
   * 從 CWA API 獲取預報資料並寫入 forecast 集合
   * GET /api/CWA/batch/forecast?locationId=F-D0047-071
   */
  async getBatchForecast(req, res) {
    try {
      const { locationId: Dataid } = req.query;

      if (!Dataid) {
        return res.status(400).json({
          success: false,
          message: "請提供 locationId 參數",
          example: "GET /api/CWA/batch/forecast?locationId=F-D0047-071",
        });
      }

      console.log(`📡 獲取 CWA 預報資料: locationId=${Dataid}`);

      const result = await this.cwaService.getWeatherForecast(Dataid);

      res.status(200).json({
        success: true,
        message: "CWA 預報資料獲取並儲存成功",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("獲取 CWA 預報資料失敗:", error);

      res.status(500).json({
        success: false,
        message: "獲取 CWA 預報資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 從資料庫查詢 CWA 資料
   * GET /api/CWA/data
   */
  async getCWAData(req, res) {
    try {
      const result = await this.cwaService.getWeatherDataFromDB(req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("查詢 CWA 資料失敗:", error);

      res.status(500).json({
        success: false,
        message: "查詢 CWA 資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 從 forecast 集合查詢預報資料
   * GET /api/CWA/forecast/data
   */
  async getForecastData(req, res) {
    try {
      const result = await this.cwaService.getForecastFromDB(req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("查詢 forecast 資料失敗:", error);

      res.status(500).json({
        success: false,
        message: "查詢 forecast 資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 根據 ID 獲取特定 CWA 資料
   * GET /api/CWA/data/:id
   */
  async getCWAById(req, res) {
    try {
      const { id } = req.params;
      const cwaData = await this.cwaService.getWeatherDataById(id);

      res.status(200).json({
        success: true,
        data: cwaData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("獲取 CWA 資料失敗:", error);

      const statusCode = error.message.includes("找不到") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: "獲取 CWA 資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 獲取 CWA 資料統計
   * GET /api/CWA/stats
   */
  async getCWAStats(req, res) {
    try {
      const stats = await this.cwaService.getWeatherStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("獲取 CWA 統計資料失敗:", error);

      res.status(500).json({
        success: false,
        message: "獲取 CWA 統計資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 刷新 CWA 資料 (重新從 CWA 獲取)
   * POST /api/CWA/refresh
   */
  async refreshCWAData(req, res) {
    try {
      const cwaData = await this.cwaService.refreshWeatherData(req.body);

      res.status(200).json({
        success: true,
        message: "CWA 資料刷新成功",
        data: cwaData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("刷新 CWA 資料失敗:", error);

      res.status(500).json({
        success: false,
        message: "刷新 CWA 資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 刪除 CWA 資料
   * DELETE /api/CWA/data/:id
   */
  async deleteCWAData(req, res) {
    try {
      const { id } = req.params;
      const deletedData = await this.cwaService.deleteWeatherData(id);

      res.status(200).json({
        success: true,
        message: "CWA 資料刪除成功",
        deletedId: id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("刪除 CWA 資料失敗:", error);

      const statusCode = error.message.includes("找不到") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: "刪除 CWA 資料失敗",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 健康檢查端點
   * GET /api/CWA/health
   */
  async healthCheck(req, res) {
    try {
      const health = await this.cwaService.checkHealth();

      res.status(200).json({
        ...health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("健康檢查失敗:", error);

      res.status(503).json({
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = cwaController;
