// CWA (中央氣象局) API 服務
const axios = require("axios");
const { cwaApiConfig } = require("../config/cwaApi");
const forecast = require("../models/mongoDB/forecastModel");

/**
 * CWA API 服務類別
 * 負責與中央氣象局 API 的所有互動
 */
class cwaApiService {
  constructor() {
    this.config = cwaApiConfig;
    this.httpClient = this.createHttpClient();
  }
  /**
   * 建立 HTTP 客戶端，包含重試機制和錯誤處理
   */
  createHttpClient() {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // 請求攔截器，自動加入 API Key
    client.interceptors.request.use(
      (config) => {
        config.params = {
          ...config.params,
          Authorization: this.config.apiKey,
        };
        console.log(
          `🌐 發送 CWA API 請求: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("❌ 請求攔截器錯誤:", error);
        return Promise.reject(error);
      }
    );

    // 回應攔截器，統一錯誤處理
    client.interceptors.response.use(
      (response) => {
        console.log(`✅ CWA API 回應成功: ${response.status}`);
        return response;
      },
      async (error) => {
        console.error(
          `❌ CWA API 錯誤: ${error.response?.status} - ${error.message}`
        );
        return error;
      }
    );
    return client;
  }
  /**
   * 取得特定地區的天氣預報資料
   * @param {string} Dataid - 地區ID
   */
  async getWeatherForecast(Dataid) {
    try {
      // 向 CWA API 發送請求
      const response = await this.httpClient.get(
        `/v1/rest/datastore/F-D0047-093?locationId=${Dataid}`
      );

      // 從 response.data 取出實際的 CWA 資料
      const cwaData = response.data;

      // 檢查資料格式
      if (
        !cwaData.records ||
        !cwaData.records.Locations ||
        cwaData.records.Locations.length === 0
      ) {
        throw new Error("CWA API 回應格式異常或無資料");
      }

      // 取第一個 Location 的資料
      const locationData = cwaData.records.Locations[0];

      // 按照 forecastModel schema 組織資料
      const forecastData = {
        DatasetDescription: locationData.DatasetDescription,
        LocationsName: locationData.LocationsName,
        Dataid: locationData.Dataid,
        Location: locationData.Location,
      };

      // Debug: 確認要儲存的資料
      console.log("📋 準備儲存的資料:", {
        DatasetDescription: forecastData.DatasetDescription,
        LocationsName: forecastData.LocationsName,
        Dataid: forecastData.Dataid,
        LocationCount: forecastData.Location.length,
      });

      // 寫入資料庫
      const savedRecord = await forecast.create(forecastData);
      console.log(
        `✅ 成功儲存 Dataid: ${Dataid} 的天氣預報到資料庫，ID: ${savedRecord._id}`
      );

      return response.data;
    } catch (error) {
      console.error("取得天氣預報失敗:", error);
      throw error;
    }
  }

  /**
   * 批量獲取多個地區的天氣資料
   * @param {Array<string>} locations - 地區陣列
   */
  async fetchMultipleLocations(locations) {
    try {
      const results = await Promise.allSettled(
        locations.map((location) => this.getWeatherForecast(location))
      );

      return results.map((result, index) => ({
        location: locations[index],
        success: result.status === "fulfilled",
        data: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason.message : null,
      }));
    } catch (error) {
      console.error("批量獲取天氣資料失敗:", error);
      throw error;
    }
  }

  /**
   * 從資料庫查詢天氣資料
   * @param {Object} options - 查詢選項
   */
  async getWeatherDataFromDB(options = {}) {
    try {
      const {
        locationName,
        dataid,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = { isActive: true };

      if (locationName) {
        query.LocationsName = { $regex: locationName, $options: "i" };
      }
      if (dataid) {
        query.Dataid = dataid;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [weatherData, totalCount] = await Promise.all([
        forecast
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        forecast.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      return {
        data: weatherData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      };
    } catch (error) {
      console.error("查詢天氣資料失敗:", error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取特定天氣資料
   * @param {string} id - 資料 ID
   */
  async getWeatherDataById(id) {
    try {
      const weatherData = await forecast.findById(id).lean();

      if (!weatherData) {
        throw new Error("找不到指定的天氣資料");
      }

      return weatherData;
    } catch (error) {
      console.error("獲取天氣資料失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取天氣資料統計
   */
  async getWeatherStats() {
    try {
      const stats = await TaiwanWeatherForecasts.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $group: {
            _id: "$LocationsName",
            count: { $sum: 1 },
            latestUpdate: { $max: "$lastProcessed" },
            oldestRecord: { $min: "$createdAt" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const totalRecords = await TaiwanWeatherForecasts.countDocuments({
        isActive: true,
      });

      return {
        totalRecords,
        locationStats: stats,
        summary: {
          totalLocations: stats.length,
          avgRecordsPerLocation: Math.round(totalRecords / stats.length),
        },
      };
    } catch (error) {
      console.error("獲取統計資料失敗:", error);
      throw error;
    }
  }

  /**
   * 刷新天氣資料
   * @param {Object} options - 刷新選項
   */
  async refreshWeatherData(options = {}) {
    try {
      const { locationName, forceUpdate = false } = options;

      console.log(`🔄 刷新天氣資料: ${locationName || "全部地區"}`);

      if (forceUpdate) {
        const deleteQuery = locationName ? { LocationsName: locationName } : {};
        const deletedCount = await forecast.deleteMany(deleteQuery);
        console.log(`🗑️ 已刪除 ${deletedCount.deletedCount} 筆舊資料`);
      }

      const weatherData = await this.getWeatherForecast(locationName);

      return weatherData;
    } catch (error) {
      console.error("刷新天氣資料失敗:", error);
      throw error;
    }
  }

  /**
   * 刪除天氣資料
   * @param {string} id - 資料 ID
   */
  async deleteWeatherData(id) {
    try {
      const deletedData = await forecast.findByIdAndDelete(id);

      if (!deletedData) {
        throw new Error("找不到要刪除的天氣資料");
      }

      return deletedData;
    } catch (error) {
      console.error("刪除天氣資料失敗:", error);
      throw error;
    }
  }

  /**
   * 根據 locationId 獲取天氣預報並寫入 forecast 集合
   * @param {string} locationId - CWA 地區 ID (如: F-D0047-071)
   */
  async getForecastByLocationId(locationId) {
    try {
      if (!locationId) {
        throw new Error("locationId 是必填參數");
      }

      console.log(`🌐 獲取 locationId: ${locationId} 的天氣預報`);

      // 向 CWA API 發送請求
      const response = await this.httpClient.get(
        `/v1/rest/datastore/F-D0047-093?locationId=${locationId}`
      );

      if (!response.data || !response.data.records) {
        throw new Error("CWA API 回應格式異常");
      }

      const cwaData = response.data;

      // 準備存入資料庫的資料
      const forecastData = {
        DatasetDescription: cwaData.records?.datasetDescription || "",
        LocationsName: cwaData.records?.locationsName || "",
        Dataid: cwaData.records?.dataid || "",
        locationId: locationId,
        Location: cwaData.records?.locations || [],
        isActive: true,
        lastProcessed: new Date(),
      };

      // 先刪除相同 locationId 的舊資料
      await forecast.deleteMany({ locationId: locationId });

      // 儲存新資料到 forecast 集合
      const savedForecast = await forecast.create(forecastData);

      console.log(
        `✅ 成功儲存 locationId: ${locationId} 的天氣預報到 forecast 集合`
      );

      return {
        success: true,
        locationId: locationId,
        data: cwaData,
        savedToDb: savedForecast._id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ 獲取 locationId: ${locationId} 的天氣預報失敗:`, error);
      throw error;
    }
  }

  /**
   * 從 forecast 集合查詢資料
   * @param {Object} options - 查詢選項
   */
  async getForecastFromDB(options = {}) {
    try {
      const {
        locationId,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = { isActive: true };

      if (locationId) {
        query.locationId = locationId;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [forecastData, totalCount] = await Promise.all([
        forecast
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        forecast.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      return {
        data: forecastData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      };
    } catch (error) {
      console.error("查詢 forecast 資料失敗:", error);
      throw error;
    }
  }

  /**
   * 檢查服務健康狀態
   */
  async checkHealth() {
    try {
      const forecastCount = await forecast.countDocuments();

      const latestForecast = await forecast
        .findOne({}, { lastProcessed: 1 })
        .sort({ lastProcessed: -1 });

      return {
        status: "healthy",
        database: {
          connected: true,
          forecastRecordCount: forecastCount,
        },
        lastForecastUpdate: latestForecast?.lastProcessed || null,
      };
    } catch (error) {
      console.error("健康檢查失敗:", error);
      throw error;
    }
  }
}

module.exports = cwaApiService;
