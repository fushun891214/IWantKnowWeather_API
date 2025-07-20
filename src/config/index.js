import { connectDB, disconnectDB } from "./database.js";
import { cwaApiConfig, validateCWAConfig } from "./CWAApi.js";
import { authConfig, validateAuthConfig } from "./auth.js";

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
  port: parseInt(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || null,
  },
};

export {
  appConfig,
  authConfig,
  cwaApiConfig,
  connectDB,
  disconnectDB,
  validateAllConfig,
};
