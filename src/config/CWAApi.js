require("dotenv").config();

const cwaApiConfig = {
  baseURL: process.env.CWA_API_URL,
  apiKey: process.env.CWA_API_KEY,
  timeout: 3000,
};

// 驗證API Key是否存在
const validateCWAConfig = () => {
  const missingKeys = [];

  if (!cwaApiConfig.apiKey) {
    missingKeys.push("CWA_API_KEY");
  }

  if (missingKeys.length > 0) {
    console.warn(`Warning: Missing API keys: ${missingKeys.join(", ")}`);
  }

  return missingKeys.length === 0;
};

module.exports = {
  cwaApiConfig,
  validateCWAConfig,
};
