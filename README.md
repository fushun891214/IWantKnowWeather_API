# IWantKnowWeather API Server

基於 Express 和 MongoDB 的天氣 API 代理伺服器，提供安全的第三方 API 整合和客戶端認證。

## 🏗️ 專案架構

```
src/
├── config/           # 配置管理
├── controllers/      # HTTP 請求控制
├── services/         # 業務邏輯服務
├── models/          # 數據庫模型
├── middlewares/     # 中間件
├── routes/          # 路由定義
└── utils/           # 工具函數
```

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境配置
```bash
cp .env.example .env
# 編輯 .env 檔案，填入必要的配置
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

### 4. 檢查伺服器狀態
```bash
curl http://localhost:3000/health
```

## 📋 環境變數

| 變數名 | 描述 | 預設值 |
|--------|------|--------|
| `PORT` | 伺服器埠號 | 3000 |
| `MONGODB_URI` | MongoDB 連接字串 | - |
| `WEATHER_API_KEY` | 第三方天氣 API Key | - |
| `JWT_SECRET` | JWT 密鑰 | - |
| `API_KEY_SECRET` | API Key 加密密鑰 | - |

## 🛠️ 開發指令

- `npm start` - 啟動生產伺服器
- `npm run dev` - 啟動開發伺服器 (nodemon)
- `npm test` - 執行測試
- `npm run lint` - 程式碼檢查
- `npm run lint:fix` - 自動修復程式碼問題

## 📊 API 端點

### 健康檢查
```
GET /health
```

### API 文檔
```
GET /api/docs
```

## 🔐 安全特性

- API Key 認證
- 請求頻率限制
- 安全標頭 (Helmet)
- 請求日誌記錄
- 錯誤處理

## 📁 核心檔案說明

- `src/app.js` - 應用程式主入口
- `src/config/` - 配置檔案
- `src/models/ApiKey.js` - API Key 數據模型
- `src/models/ApiRequest.js` - 請求日誌模型

---

建立日期: $(date)