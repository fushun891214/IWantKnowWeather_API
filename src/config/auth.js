import dotenv from 'dotenv';

dotenv.config();

// 簡化的認證配置
const authConfig = {
  clientApiKey: process.env.CLIENT_API_KEY || 'default_client_key'
};

// 驗證認證配置
const validateAuthConfig = () => {
  const warnings = [];
  
  if (authConfig.clientApiKey === 'default_client_key') {
    warnings.push('Using default client API key - please set CLIENT_API_KEY in environment');
  }
  
  if (warnings.length > 0) {
    console.warn('Auth Config Warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }
  
  return warnings;
};

export { authConfig, validateAuthConfig };