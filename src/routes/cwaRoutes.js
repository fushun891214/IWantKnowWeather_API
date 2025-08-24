import express from "express";
import CWAController from "../controllers/cwaController.js";

const router = express.Router();
const cwaController = new CWAController();

/**
 * 從 CWA API 獲取預報資料並寫入 forecast 集合
 * GET /api/cwa/forecast?location={regition}
 * Query params:
 *   - regition: 地區 (必填)
 */
router.get("/forecast", cwaController.getForecast.bind(cwaController));

/**
 * 從 CWA API 獲取預報資料並寫入 forecast 集合
 * GET /api/cwa/forecast/all
 */
router.get("/forecast/all", cwaController.getForecastAll.bind(cwaController));

export default router;
