import express from "express";
import DataController from "../controllers/dataController.js";

const router = express.Router();
const dataController = new DataController();

/**
 * 從資料庫查詢特定城市及區域的天氣預報資料
 * GET /api/data/forecast?city={cityName}&district={districtName}
 * Query params:
 *   - city: 城市名稱 (必填，例如: taipeiCity, kaohsiungCity)
 *   - district: 區域名稱 (選填，例如: zhongshanDistrict, xinzhubDistrict)
 */
router.get("/forecast", dataController.getForecast.bind(dataController));

export default router;
