import axios from "axios";
import { cwaApiConfig } from "../config/CWAApi.js";
import forecast from "../models/mongoDB/forecastModel.js";
import { CITY_TO_CWA_CODE } from "../util/regition.js";

class CWAApiBase {
  constructor() {
    this.config = cwaApiConfig;
    this.httpClient = this.createHttpClient();
  }

  // 建立 HTTP 客戶端，包含重試機制和錯誤處理
  createHttpClient() {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: this.config.apiKey,
      },
    });

    // 請求攔截器
    client.interceptors.request.use(
      async (config) => {
        console.log("📤 發送請求:", config.url);
        return config;
      },
      async (error) => {
        console.error("❌ 請求攔截器錯誤:", error);
        return Promise.reject(error);
      }
    );

    // 回應攔截器
    client.interceptors.response.use(
      async (response) => {
        console.log("✅ CWA API 回應成功: ${response.status}");
        return response;
      },
      async (error) => {
        console.error(
          "❌ CWA API 錯誤: ${error.response?.status} - ${error.message}"
        );
        return error;
      }
    );
    return client;
  }
}

class CWAApiService extends CWAApiBase {
  /**
   * 取得特定地區的天氣預報資料
   * @param {string} cityName - 地區名稱 (如: "taipeiCity")
   */
  async getWeatherForecast(cityName) {
    try {
      // 透過對照表轉換地名為 CWA 代碼
      const locationCode = CITY_TO_CWA_CODE[cityName];

      // 向 CWA API 發送請求
      const response = await this.httpClient.get(
        `/v1/rest/datastore/${locationCode}`
      );

      // 從 response.data 取出實際的 CWA 資料
      const cwaData = response.data;

      // 取第一個 Location 的資料
      const locationData = cwaData.records.Locations[0];

      // 按照 forecastModel schema 組織資料
      const forecastData = {
        DatasetDescription: locationData.DatasetDescription,
        LocationsName: locationData.LocationsName,
        Dataid: locationData.Dataid,
        Location: locationData.Location,
      };

      // 寫入DB
      await forecast.create(forecastData);

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default CWAApiService;
