const { connectDB, disconnectDB } = require("./database");
const { cwaApiConfig, validateCWAConfig } = require("./cwaApi");
const { authConfig, validateAuthConfig } = require("./auth");

// 總配置驗證
const validateAllConfig = () => {
  console.log("🔧 Validating configuration...");

  const apiValid = validateCWAConfig();
  const authWarnings = validateAuthConfig();

  if (!apiValid) {
    console.error("❌ API configuration validation failed");
  } else {
    console.log("✅ API configuration is valid");
  }

  if (authWarnings.length === 0) {
    console.log("✅ Auth configuration is valid");
  }

  console.log("📋 Configuration validation complete\n");

  return apiValid;
};

// 應用配置
const appConfig = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    file: process.env.LOG_FILE,
  },
};

module.exports = {
  appConfig,
  authConfig,
  cwaApiConfig,
  connectDB,
  disconnectDB,
  validateAllConfig,
};
