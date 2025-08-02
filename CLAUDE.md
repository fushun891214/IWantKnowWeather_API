# CLAUDE.md

1.預設都是用中文回答使用者問題

2.一律都是先規劃程式實作流程，待使用者同意後，才進行下一步實作

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IWantKnowWeather API 是一個基於 Express.js 和 MongoDB 的台灣天氣 API 代理服務，專門提供中央氣象局 (CWA) 天氣預報資料。本服務作為客戶端與 CWA API 之間的安全閘道，實現 API Key 驗證、資料快取和請求記錄等功能。

**技術特色：**

- 使用 ES Modules (而非 CommonJS)
- 分層架構設計 (Route → Controller → Service)
- 地名自動轉換 (英文地名 → CWA 代碼)
- MongoDB 資料持久化

## Development Commands

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run Jest tests
npm run lint        # Run ESLint code checking
npm run lint:fix    # Auto-fix ESLint issues

# Environment setup
cp .env.example .env # Copy environment template

# Health check
curl http://localhost:3000/

# Test API
curl http://localhost:3000/api/cwa/forecast?location=taipeiCity \
  -H "X-API-Key: default_client_key"
```

## Current Architecture

### ES Modules 架構

專案已完全轉換為 ES Modules，所有檔案使用：

- `import` 而非 `require()`
- `export default` 或 `export {}` 而非 `module.exports`
- 檔案路徑必須包含 `.js` 副檔名

### 分層架構模式

```
Client Request → Route → Controller → Service → CWA API
              ↓        ↓           ↓         ↓
              ↓        ↓           ↓         Database
              ↓        ↓           ↓         ↓
Client Response ← Route ← Controller ← Service ← Response
```

**專案結構：**

- **src/config/** - 集中式配置管理和驗證
- **src/routes/** - HTTP 路由定義和中介軟體綁定
- **src/middlewares/** - 請求攔截器（簡化版認證、日誌）
- **src/controllers/** - HTTP 請求/回應處理和資料轉換
- **src/services/** - 核心業務邏輯和第三方 API 整合
- **src/models/** - MongoDB 結構定義和資料庫操作
- **src/util/** - 可重用的工具函數和地名對照表

### 核心架構組件

**路由系統 (`src/routes/CWARoutes.js`)**

- 主要端點：`/api/cwa/*`
- 目前活躍路由：`/api/cwa/forecast`
- 使用 `.bind()` 確保 Controller 方法的 `this` 上下文

**控制器層 (`src/controllers/CWAController.js`)**

- `getForecast()` - 主要的天氣預報獲取端點
- 負責參數提取、地名轉換、回應格式化
- 使用 `CITY_TO_CWA_CODE` 進行地名轉換

**服務層 (`src/services/CWAApiService.js`)**

- `getWeatherForecast(locationCode)` - 核心業務邏輯
- 包含 HTTP 客戶端配置、錯誤處理
- 自動加入 CWA API Key 驗證
- 資料處理和 MongoDB 存儲

**資料模型 (`src/models/mongoDB/forecastModel.js`)**

- `forecastsSchema` - 天氣預報資料結構
- 包含 `DatasetDescription`, `LocationsName`, `Dataid`, `Location` 等欄位
- 自動時間戳記功能

**地名對照表 (`src/util/regition.js`)**

- `CITY_TO_CWA_CODE` - 英文地名到 CWA 代碼的對照表
- 使用小駝峰命名：`taipeiCity`, `hsinchuCounty` 等
- 支援縣市區分避免重名問題

### 關鍵環境變數

運行所需：

- `MONGODB_URI` - MongoDB 資料庫連線
- `CWA_API_KEY` - 中央氣象局 API 金鑰
- `CWA_API_URL` - CWA API 基礎 URL
- `CLIENT_API_KEY` - 客戶端 API Key (簡化認證)
- `PORT` - 服務埠號 (預設 3000)
- `NODE_ENV` - 環境設定 (development/production)
- `LOG_LEVEL` - 日誌等級 (預設 info)

## API Endpoints

### 目前可用端點

```bash
# 根端點 - 服務狀態
GET /
Response: {"message": "IWantKnowWeather API Server", "version": "1.0.0", "status": "running"}

# 獲取天氣預報 (從 CWA API 並存入資料庫)
GET /api/cwa/forecast?location={cityName}
Headers: X-API-Key: default_client_key
Example: GET /api/cwa/forecast?location=taipeiCity

# 支援的地名格式 (小駝峰)
# 縣: yilanCounty, hsinchuCounty, miaoliCounty, changhuaCounty, nantouCounty,
#     yunlinCounty, chiayiCounty, pingtungCounty, taitungCounty, hualienCounty,
#     penghuCounty, lienchiangCounty, kinmenCounty
# 市: taoyuanCity, keelungCity, hsinchuCity, chiayiCity, taipeiCity,
#     kaohsiungCity, newTaipeiCity, taichungCity, tainanCity
# 特殊: taiwan
```

### API 流程

1. **接收請求**：Route 接收 HTTP 請求
2. **認證檢查**：SimpleAuth 驗證 API Key
3. **參數處理**：Controller 提取 `location` 參數
4. **地名轉換**：`CITY_TO_CWA_CODE[location]` 轉換為 CWA 代碼
5. **API 呼叫**：Service 向 CWA API 發送請求
6. **資料存儲**：將回應資料存入 MongoDB
7. **回應客戶端**：返回格式化的 JSON 回應

## Middleware 架構

### 簡化認證中介軟體 (`src/middlewares/simpleAuth.js`)

**核心功能：**

- 基本 API Key 驗證
- 支援 `X-API-Key` header 和 `Authorization: Bearer` 格式
- 使用環境變數 `CLIENT_API_KEY` 進行比較
- 精簡設計，專注單一職責

### 日誌中介軟體 (`src/middlewares/logger.js`)

**核心功能：**

- 使用 Winston 進行結構化日誌
- 記錄請求和回應資訊
- 支援檔案和 Console 輸出
- 包含請求時間、IP、User Agent 等資訊

## Development Guidelines

### ES Modules 規範

- **Import 語法**：使用 `import` 而非 `require()`
- **Export 語法**：使用 `export default` 或 `export {}`
- **檔案副檔名**：所有 import 路徑必須包含 `.js`
- **模組檢查**：使用 `import.meta.url` 檢查主模組

### 配置管理

- 所有配置統一在 `src/config/` 目錄
- 環境變數需要適當的預設值
- 使用 `validateAllConfig()` 驗證配置完整性
- 配置檔案使用 ES modules 導出

### 資料庫操作

- Model 檔案使用 `export default`
- 所有資料庫操作都在 Service 層
- 使用 Mongoose schema 進行資料驗證
- 考慮索引效能和資料結構

### API 設計原則

- RESTful 設計原則
- 統一的錯誤回應格式
- 包含時間戳記的回應
- 使用適當的 HTTP 狀態碼

### 程式碼品質

- **單一職責**：每個檔案/函數只負責一個功能
- **簡潔明瞭**：避免過度複雜的邏輯
- **錯誤處理**：適當的 try-catch 和錯誤訊息
- **一致性**：統一的命名慣例和程式碼風格

## Testing Strategy

### 測試環境

- 使用獨立的測試資料庫
- Mock 外部 API 呼叫
- 環境變數隔離

### 測試覆蓋

- 單元測試：Service 層邏輯
- 整合測試：API 端點
- 錯誤處理測試

## Security Considerations

- API Key 基本認證機制
- 請求日誌記錄（不包含敏感資訊）
- 環境變數管理敏感配置
- CORS 和安全標頭配置

## Performance Optimization

- MongoDB 連線池管理
- 適當的資料庫索引
- HTTP 客戶端超時設定
- 資料快取策略

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
