require('dotenv').config();

const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret',
    expiresIn: '24h',
    algorithm: 'HS256'
  },
  
  apiKey: {
    secret: process.env.API_KEY_SECRET || 'fallback_api_key_secret',
    length: 32,
    prefix: 'iwkw_',
    headerName: 'x-api-key',
    queryParamName: 'apiKey'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分鐘
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000 // 30分鐘
  }
};

// 驗證認證配置
const validateAuthConfig = () => {
  const warnings = [];
  
  if (authConfig.jwt.secret === 'fallback_jwt_secret') {
    warnings.push('Using fallback JWT secret - please set JWT_SECRET in environment');
  }
  
  if (authConfig.apiKey.secret === 'fallback_api_key_secret') {
    warnings.push('Using fallback API key secret - please set API_KEY_SECRET in environment');
  }
  
  if (warnings.length > 0) {
    console.warn('Auth Config Warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }
  
  return warnings;
};

module.exports = {
  authConfig,
  validateAuthConfig
};