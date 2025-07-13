const winston = require("winston");
const { appConfig } = require("../config");

// Winston logger
// 建立 transports 陣列
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// 只有在設定 LOG_FILE 時才加入 File transport
if (appConfig.logging.file) {
  transports.push(
    new winston.transports.File({
      filename: appConfig.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: appConfig.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "iwantknowweather-api" },
  transports,
});

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  logger.info("Request received", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    return originalSend.call(this, data);
  };

  next();
};

module.exports = loggerMiddleware;
