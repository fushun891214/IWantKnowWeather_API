import { CITY_TO_CWA_CODE } from "../util/regition.js";
import forecastRegionFactoryModel from "../models/mongoDB/forecastRegionFactoryModel.js";

class dataService {
  /**
   * 從資料庫查詢天氣預報資料
   * @param {string} city - 城市名稱 (必填)
   * @param {string} district - 區域名稱 (必填)
   */
  async getForecastFromDB(city, district) {
    try {
      // 驗證城市是否支援
      if (!CITY_TO_CWA_CODE[city]) {
        throw new Error(`不支援的城市: ${city}`);
      }

      // 透過 forecastRegionFactoryModel 取得對應的 Model
      const RegionModel = forecastRegionFactoryModel.getRegionModel(city);

      // 使用 aggregate 查詢最新的預報資料
      const pipeline = [
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
        {
          $unwind: {
            path: "$Location",
          },
        },
        {
          $match: {
            "Location.LocationName": district,
          },
        },
        {
          $project: {
            Location: 1,
          },
        },
      ];

      const results = await RegionModel.aggregate(pipeline);

      console.log(results);

      if (!results || results.length === 0) {
        const errorMessage = district
          ? `在 ${city} 中找不到包含 "${district}" 的預報資料`
          : `找不到 ${city} 的預報資料`;
        throw new Error(errorMessage);
      }

      return results[0];
    } catch (error) {
      throw new Error(`查詢資料庫失敗: ${error.message}`);
    }
  }
}

export default dataService;
