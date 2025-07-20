// CWA API 路由
const express = require("express");
const CWAController = require("../controllers/cwaController");

const router = express.Router();
const cwaController = new CWAController();

/**
 * 從 CWA API 獲取預報資料並寫入 forecast 集合
 * GET /api/cwa/batch/forecast?locationId=F-D0047-071
 * Query params:
 *   - locationId: 地區id (必填)
 */
router.get(
  "/batch/forecast",
  cwaController.getBatchForecast.bind(cwaController)
);

/**
 * 查詢 forecast 集合中的預報資料
 * GET /api/CWA/forecast/data
 * Query params:
 *   - locationId: 地區ID (選填)
 *   - page: 頁數 (預設: 1)
 *   - limit: 每頁筆數 (預設: 10)
 *   - sortBy: 排序欄位 (預設: createdAt)
 *   - sortOrder: 排序順序 asc/desc (預設: desc)
 */
router.get("/forecast/data", cwaController.getForecastData.bind(cwaController));

/**
 * 查詢資料庫中的 CWA 資料
 * GET /api/CWA/data
 * Query params:
 *   - locationName: 地區名稱搜尋 (選填)
 *   - dataid: 資料集ID (選填)
 *   - page: 頁數 (預設: 1)
 *   - limit: 每頁筆數 (預設: 10)
 *   - sortBy: 排序欄位 (預設: createdAt)
 *   - sortOrder: 排序順序 asc/desc (預設: desc)
 */
router.get("/data", cwaController.getCWAData.bind(cwaController));

/**
 * 根據 ID 獲取特定 CWA 資料
 * GET /api/CWA/data/:id
 */
router.get("/data/:id", cwaController.getCWAById.bind(cwaController));

/**
 * 獲取 CWA 資料統計
 * GET /api/CWA/stats
 */
router.get("/stats", cwaController.getCWAStats.bind(cwaController));

/**
 * 刷新 CWA 資料 (重新從 CWA 獲取)
 * POST /api/CWA/refresh
 * Body: { locationName?: string, forceUpdate?: boolean }
 */
router.post("/refresh", cwaController.refreshCWAData.bind(cwaController));

/**
 * 刪除 CWA 資料
 * DELETE /api/CWA/data/:id
 */
router.delete("/data/:id", cwaController.deleteCWAData.bind(cwaController));

/**
 * 健康檢查端點
 * GET /api/CWA/health
 */
router.get("/health", cwaController.healthCheck.bind(cwaController));

module.exports = router;

/**
 * API 使用範例:
 *
 * // 健康檢查 (無需認證)
 * GET /api/CWA/health
 *
 * // 從 CWA API 獲取預報資料並寫入 forecast 集合
 * GET /api/CWA/batch/forecast?locationId=F-D0047-071
 * Headers: { "X-API-Key": "your-client-key" }
 *
 * // 查詢 forecast 集合中的預報資料
 * GET /api/CWA/forecast/data?locationId=F-D0047-071&page=1&limit=5
 * Headers: { "X-API-Key": "your-client-key" }
 *
 * // 查詢資料庫資料 (分頁)
 * GET /api/CWA/data?page=1&limit=5&locationName=台北
 * Headers: { "X-API-Key": "your-client-key" }
 *
 * // 根據 ID 獲取特定資料
 * GET /api/CWA/data/:id
 * Headers: { "X-API-Key": "your-client-key" }
 *
 * // 獲取統計資料
 * GET /api/CWA/stats
 * Headers: { "X-API-Key": "your-client-key" }
 *
 * // 刷新資料
 * POST /api/CWA/refresh
 * Headers: { "X-API-Key": "your-client-key" }
 * Body: { "locationName": "臺北市", "forceUpdate": true }
 *
 * // 刪除資料
 * DELETE /api/CWA/data/:id
 * Headers: { "X-API-Key": "your-client-key" }
 */
