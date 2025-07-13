const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { appConfig, connectDB, validateAllConfig } = require("./config");
const logger = require("./middlewares/logger");

const app = express();

// 安全中間件
app.use(helmet());
app.use(cors(appConfig.cors));

// 請求解析中間件
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 日誌中間件
app.use(morgan("combined"));
app.use(logger);

// API 路由
app.get("/", (req, res) => {
  res.json({
    message: "IWantKnowWeather API Server",
    version: "1.0.0",
    status: "running"
  });
});

// CWA API 路由
const CWARoutes = require("./routes/CWARoutes");
app.use("/api/CWA", CWARoutes);

// 404 處理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// 全域錯誤處理
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    error: error.message || "Internal server error",
    ...(appConfig.env === "development" && { stack: error.stack }),
  });
});

// 伺服器啟動
const startServer = async () => {
  try {
    // 驗證配置
    const configValid = validateAllConfig();
    if (!configValid) {
      console.error("❌ Configuration validation failed. Exiting...");
      process.exit(1);
    }

    // 連接資料庫
    await connectDB();

    // 啟動伺服器
    const server = app.listen(appConfig.port, () => {
      console.log(`
🚀 IWantKnowWeather API Server is running!
📍 Environment: ${appConfig.env}
🌐 Port: ${appConfig.port}
📊 Health check: http://localhost:${appConfig.port}/health
      `);
    });

    // 優雅關閉處理
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed.");

        try {
          const { disconnectDB } = require("./config");
          await disconnectDB();
          console.log("Database disconnected.");
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// 啟動伺服器
if (require.main === module) {
  startServer();
}

module.exports = app;
