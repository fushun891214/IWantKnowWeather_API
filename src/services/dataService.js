import { CITY_TO_CWA_CODE } from "../util/regition.js";
import forecastRegionFactoryModel from "../models/mongoDB/forecastRegionFactoryModel.js";

class dataService {
  /**
   * 從資料庫查詢天氣預報資料
   * @param {string} city - 城市名稱 (必填)
   * @param {string} district - 區域名稱 (選填)
   */
  async getForecastFromDB(city, district) {
    try {
      // 驗證城市是否支援
      if (!CITY_TO_CWA_CODE[city]) {
        throw new Error(`不支援的城市: ${city}`);
      }

      // 透過 forecastRegionFactoryModel 取得對應的 Model
      const RegionModel = forecastRegionFactoryModel.getRegionModel(city);

      // 查詢最新的預報資料（按建立時間排序）
      let results = await RegionModel.find({}).sort({ createdAt: -1 }).limit(1);

      if (!results || results.length === 0) {
        throw new Error(`找不到 ${city} 的預報資料`);
      }

      let forecastData = results[0];

      // 如果指定了 district，進一步篩選 Location 資料
      if (district && forecastData.Location) {
        const filteredLocations = forecastData.Location.filter(
          (location) =>
            location.LocationName && location.LocationName.includes(district)
        );

        if (filteredLocations.length === 0) {
          throw new Error(`在 ${city} 中找不到 ${district} 的資料`);
        }

        // 複製資料並只返回符合的 Location
        forecastData = {
          ...forecastData.toObject(),
          Location: filteredLocations,
        };
      }

      return forecastData;
    } catch (error) {
      throw new Error(`查詢資料庫失敗: ${error.message}`);
    }
  }
}

export default dataService;
