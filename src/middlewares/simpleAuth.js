/**
 * 簡化的 API Key 認證中介軟體
 * 僅進行基本的 API Key 驗證
 */
const simpleAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const validKey = process.env.CLIENT_API_KEY || 'default_client_key';
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: '需要提供 API Key',
      hint: '請在 header 中提供 X-API-Key'
    });
  }

  if (apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: '無效的 API Key'
    });
  }

  next();
};

export { simpleAuth };