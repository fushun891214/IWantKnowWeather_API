# CLAUDE.md

預設都是用中文回答使用者問題
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IWantKnowWeather API 是一個基於 Express.js 和 MongoDB 的台灣天氣 API 代理服務，專門提供中央氣象局 (CWA) 天氣預報資料。本服務作為客戶端與 CWA API 之間的安全閘道，實現 API Key 驗證、動態速率限制、資料快取和請求記錄等功能。

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
curl http://localhost:3000/api/CWA/health

# API Key Management
node src/utils/createTestApiKey.js     # Create test API keys
node src/utils/testMiddleware.js       # Test middleware functionality
```

## Current Architecture

### 分層架構模式

專案採用嚴格的分層架構，職責清楚分離：

- **config/** - 集中式配置管理和驗證
- **routes/** - HTTP 路由定義和中介軟體綁定  
- **middlewares/** - 請求攔截器（驗證、日誌、速率限制）
- **controllers/** - HTTP 請求/回應處理和資料轉換
- **services/** - 核心業務邏輯和第三方 API 整合
- **models/** - MongoDB 結構定義和資料庫操作
- **utils/** - 可重用的工具函數

### 核心架構組件

**路由系統 (`src/routes/CWARoutes.js`)**

- 主要端點：`/api/CWA/*`
- 所有路由都需要 API Key 驗證和速率限制
- 支援天氣預報獲取、資料查詢、批量處理、統計等功能

**控制器層 (`src/controllers/CWAController.js`)**

- `getForecastFromCWA()` - 從 CWA API 獲取即時天氣預報
- `getBatchForecast()` - 批量獲取多個地區天氣資料  
- `getCWAData()` - 查詢資料庫中的天氣資料（支援分頁和篩選）
- `getCWAStats()` - 獲取天氣資料統計
- `refreshCWAData()` - 刷新天氣資料
- `healthCheck()` - 服務健康檢查

**服務層 (`src/services/cwaApiService.js`)**

- 專門處理與 CWA API 的通信
- 包含 HTTP 客戶端配置、重試機制、錯誤處理
- 自動加入 CWA API Key 驗證
- 資料處理和存儲邏輯

**資料模型**

- `models/mongoDB/taiwanWeatherForecastsModel.js` - 台灣天氣預報資料結構
- `models/ApiKey.js` - 客戶端 API Key 管理
- `models/ApiRequest.js` - 請求日誌和分析

### 關鍵環境變數

運行所需：

- `MONGODB_URI` - MongoDB 資料庫連線
- `CWA_API_KEY` - 中央氣象局 API 金鑰  
- `JWT_SECRET` - JWT token 簽名
- `API_KEY_SECRET` - API Key 加密
- `PORT` - 服務埠號 (預設 3000)
- `NODE_ENV` - 環境設定 (development/production)

## API Endpoints

### 主要功能端點

```bash
# 獲取天氣預報 (從 CWA API)
GET /api/CWA/forecast?locationName=臺北市
Headers: X-API-Key: your-api-key

# 批量獲取多地區天氣
POST /api/CWA/forecast/batch
Body: { "locations": ["臺北市", "新北市"] }
Headers: X-API-Key: your-api-key

# 查詢資料庫天氣資料 (支援分頁)
GET /api/CWA/data?page=1&limit=10&locationName=台北
Headers: X-API-Key: your-api-key

# 獲取天氣資料統計
GET /api/CWA/stats
Headers: X-API-Key: your-api-key

# 刷新天氣資料
POST /api/CWA/refresh
Body: { "locationName": "臺北市", "forceUpdate": true }
Headers: X-API-Key: your-api-key

# 健康檢查
GET /api/CWA/health
```

## Middleware 架構

### 認證中介軟體 (`src/middlewares/authenticate.js`)

**核心功能：**
- 驗證 API Key（支援 `X-API-Key` header 和 `Authorization: Bearer` 格式）
- 使用 bcrypt 比較 API Key hash
- 更新 API Key 使用記錄
- 記錄請求日誌到資料庫
- 權限檢查功能

**目前問題：**
- 職責過多：包含驗證、日誌、API Key 生成等多種功能
- 程式碼過於複雜：189 行，違反單一職責原則
- 不必要的 API Key 管理功能混入 middleware

### 速率限制中介軟體 (`src/middlewares/rateLimit.js`)

**核心功能：**
- 基於 API Key 的動態速率限制
- 支援不同客戶端的個別限制設定
- 提供詳細的錯誤訊息和重試資訊

**目前問題：**
- 過於複雜：201 行，包含多種不同的 rate limiter
- 功能過多：包含狀態查詢、重置功能等非核心功能
- 冗長的錯誤訊息和配置邏輯

## Development Guidelines

### 配置管理

- 所有新配置必須加入適當的配置檔案
- 環境變數應有適當的預設值
- 任何配置更改都要執行 `validateAllConfig()`

### 資料庫結構更改

- Model 包含內建驗證、索引和輔助方法
- 使用 mongoose middleware 處理計算欄位和業務邏輯
- 考慮新索引的效能影響

### API 整合

- CWA API 配置放在 `config/CWAApis.js`
- HTTP 客戶端邏輯放在 `services/cwaApiService.js`
- 外部 API 呼叫必須實作重試邏輯和錯誤處理

### 安全考量

- API Key 使用 bcrypt hash 後存儲
- 基於個別 API Key 的速率限制配置
- 所有請求都記錄用於審計和分析
- 請求日誌包含 IP 位址、User Agent 和回應時間

### 測試策略

- 使用 `MONGODB_TEST_URI` 進行測試資料庫隔離
- 可使用 Supertest 進行 HTTP 端點測試
- 測試中需模擬外部 API 呼叫

## Current Issues & Simplification Needs

### Middleware 複雜性問題

1. **authenticate.js (189行)** - 需要簡化
   - 移除 API Key 生成功能 → 移至 `utils/apiKeyManager.js`
   - 簡化日誌記錄 → 移至獨立 logging middleware
   - 減少錯誤處理複雜度

2. **rateLimit.js (201行)** - 需要簡化  
   - 移除多種 rate limiter → 保留核心動態限制功能
   - 移除狀態查詢功能 → 移至管理 API
   - 簡化錯誤訊息和配置

### 建議重構方向

```
middlewares/
├── authenticate.js     (簡化版 ~60行)
├── rateLimit.js       (簡化版 ~80行)  
└── logging.js         (新增日誌處理)

utils/
└── apiKeyManager.js   (新增 API Key 管理)
```

### Clean Code 原則

- **單一職責**：每個 middleware 只做一件事
- **最小必要**：只保留核心業務邏輯  
- **關注點分離**：管理功能從 middleware 分離
- **簡潔回應**：錯誤訊息簡潔明瞭

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.