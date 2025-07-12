const mongoose = require('mongoose');

const apiRequestSchema = new mongoose.Schema({
  clientApiKey: {
    type: String,
    required: true,
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  thirdPartyApi: {
    type: String,
    required: true,
    enum: ['weather', 'geocoding']
  },
  thirdPartyEndpoint: {
    type: String,
    required: true
  },
  requestParams: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  responseTime: {
    type: Number,
    required: true // ëÒ
  },
  statusCode: {
    type: Number,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  dataSize: {
    type: Number, // bytes
    default: 0
  }
}, {
  timestamps: true
});

// úË"åÐØåbHý
apiRequestSchema.index({ clientApiKey: 1, createdAt: -1 });
apiRequestSchema.index({ thirdPartyApi: 1, createdAt: -1 });
apiRequestSchema.index({ success: 1, createdAt: -1 });
apiRequestSchema.index({ createdAt: -1 }); // (¼åŒ

// \K¹ÕrÖ¢6ïqxÚ
apiRequestSchema.statics.getClientStats = async function(clientApiKey, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        clientApiKey,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        successfulRequests: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failedRequests: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        avgResponseTime: { $avg: '$responseTime' },
        totalDataTransferred: { $sum: '$dataSize' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    totalDataTransferred: 0
  };
};

// \K¹ÕrÖAPI(q
apiRequestSchema.statics.getApiUsageStats = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$thirdPartyApi',
        requestCount: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
        successRate: {
          $avg: { $cond: ['$success', 1, 0] }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// \K¹Õ
åŒ (ÝYš)x)
apiRequestSchema.statics.cleanupOldLogs = async function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('ApiRequest', apiRequestSchema);