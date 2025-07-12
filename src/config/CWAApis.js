require("dotenv").config();

const CWAApiConfig = {
  weather: {
    baseURL: process.env.CWA_API_URL,
    apiKey: process.env.CWA_API_KEY,
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
    endpoints: {
      current: "/weather",
      forecast: "/forecast",
      onecall: "/onecall",
    },
  },
  // 可以添加其他第三方API配置
  // geocoding: {
  //   baseURL: 'https://api.geocoding.example.com',
  //   apiKey: process.env.GEOCODING_API_KEY,
  //   timeout: 3000
  // }
};

// 驗證必要的API Key是否存在
const validateCWAConfig = () => {
  const missingKeys = [];

  if (!CWAApiConfig.weather.apiKey) {
    missingKeys.push("CWA_API_KEY");
  }

  if (missingKeys.length > 0) {
    console.warn(`Warning: Missing API keys: ${missingKeys.join(", ")}`);
  }

  return missingKeys.length === 0;
};

module.exports = {
  CWAApiConfig,
  validateCWAConfig,
};