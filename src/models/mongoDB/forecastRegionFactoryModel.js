import mongoose from "mongoose";
import forecastsBaseSchema from "./forecastBaseModel.js";
import { CITY_TO_CWA_CODE } from "../../util/regition.js";

class forecastRegionFactoryModel {
  /**
   * 根據地區 key 生成對應的 Model
   * @param {string} regionKey - 地區 key (如: 'changhuaCounty')
   * @returns {mongoose.Model}
   */
  static createRegionModel(regionKey) {
    const collectionName = `forecasts${
      regionKey.charAt(0).toUpperCase() + regionKey.slice(1)
    }`;

    // 檢查是否已存在
    if (mongoose.models[collectionName]) {
      return mongoose.models[collectionName];
    }

    // 複製基礎 Schema 並設定 collection 名稱
    const regionSchema = forecastsBaseSchema.clone();
    regionSchema.set("collection", collectionName);

    // 建立 Model
    const RegionModel = mongoose.model(collectionName, regionSchema);

    console.log(`🏗️ 建立地區 Model: ${collectionName}`);
    return RegionModel;
  }

  /**
   * 批量建立所有地區的 Models
   * @returns {Map<string, mongoose.Model>} regionKey -> Model 的對應表
   */
  static createAllRegionModels() {
    const models = new Map();

    Object.keys(CITY_TO_CWA_CODE).forEach((regionKey) => {
      const model = this.createRegionModel(regionKey);
      models.set(regionKey, model);
    });

    console.log(`✅ 已建立 ${models.size} 個地區 Models`);
    return models;
  }

  /**
   * 根據地區 key 取得對應的 Model
   * @param {string} regionKey - 地區 key
   * @returns {mongoose.Model}
   */
  static getRegionModel(regionKey) {
    return this.createRegionModel(regionKey);
  }
}

export default forecastRegionFactoryModel;
