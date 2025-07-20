import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import { appConfig, connectDB, validateAllConfig, disconnectDB } from "./config/index.js";
// import logger from "./middlewares/logger.js";

const app = express();

// 安全中間件
app.use(helmet());
app.use(cors(appConfig.cors));

// 請求解析中間件
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 日誌中間件
app.use(morgan("combined"));
// app.use(logger);

// API 路由
app.get("/", (req, res) => {
  res.json({
    message: "IWantKnowWeather API Server",
    version: "1.0.0",
    status: "running",
  });
});

// CWA API 路由
import cwaRoutes from "./routes/CWARoutes.js";
app.use("/api/cwa", cwaRoutes);

// 404 處理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
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
📊 Health check: http://localhost:${appConfig.port}
      `);
    });

    // 優雅關閉處理
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed.");

        try {
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
// 檢查是否為主模組 (ES Modules 版本)
const isMainModule = import.meta.url === new URL(process.argv[1], 'file://').href;

if (isMainModule) {
  startServer();
}

export default app;
