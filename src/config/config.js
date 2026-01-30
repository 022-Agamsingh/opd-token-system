require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/opd-token-system',
  },
  
  slot: {
    defaultDuration: parseInt(process.env.DEFAULT_SLOT_DURATION) || 60,
    defaultMaxCapacity: parseInt(process.env.DEFAULT_MAX_CAPACITY) || 20,
  },
  
  priority: {
    EMERGENCY: parseInt(process.env.EMERGENCY_PRIORITY) || 1000,
    PAID: parseInt(process.env.PAID_PRIORITY) || 500,
    FOLLOWUP: parseInt(process.env.FOLLOWUP_PRIORITY) || 300,
    ONLINE: parseInt(process.env.ONLINE_PRIORITY) || 200,
    WALKIN: parseInt(process.env.WALKIN_PRIORITY) || 100,
  },
  
  timeout: {
    noShow: parseInt(process.env.NO_SHOW_TIMEOUT) || 15,
    lateArrivalGrace: parseInt(process.env.LATE_ARRIVAL_GRACE) || 10,
  },
  
  tokenTypes: {
    ONLINE: 'ONLINE',
    WALKIN: 'WALKIN',
    PRIORITY: 'PRIORITY',
    FOLLOWUP: 'FOLLOWUP',
    EMERGENCY: 'EMERGENCY',
  },
  
  tokenStatus: {
    SCHEDULED: 'SCHEDULED',
    WAITING: 'WAITING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
  },
};
