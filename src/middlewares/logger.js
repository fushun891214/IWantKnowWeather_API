const winston = require('winston');
const { appConfig } = require('../config');

// úË Winston logger
const logger = winston.createLogger({
  level: appConfig.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'iwantknowweather-api' },
  transports: [
    new winston.transports.File({ 
      filename: appConfig.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Express -“öýx
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // ËBÇ

  logger.info('Request received', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // *ÿÉP_
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // ÿÉÇ

    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return originalSend.call(this, data);
  };

  next();
};

module.exports = loggerMiddleware;