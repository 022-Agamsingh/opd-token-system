const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: String,
    required: true,
    index: true,
  },
  patientId: {
    type: String,
    required: true,
    index: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  slotId: {
    type: String,
    required: true,
    ref: 'Slot',
    index: true,
  },
  type: {
    type: String,
    enum: ['ONLINE', 'WALKIN', 'PRIORITY', 'FOLLOWUP', 'EMERGENCY'],
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  queuePosition: {
    type: Number,
    required: true,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CHECKED_IN', 'CONSULTING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'PENDING',
  },
  checkInTime: {
    type: Date,
    default: null,
  },
  completedTime: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  _id: false,
});

// Compound indexes
tokenSchema.index({ slotId: 1, queuePosition: 1 });
tokenSchema.index({ slotId: 1, status: 1 });

// Methods
tokenSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'CHECKED_IN' && !this.checkInTime) {
    this.checkInTime = new Date();
  }
  
  if (status === 'COMPLETED' && !this.completedTime) {
    this.completedTime = new Date();
  }
  
  Object.assign(this, additionalData);
  return this.save();
};

tokenSchema.methods.updateQueuePosition = function(position) {
  this.queuePosition = position;
  return this.save();
};

tokenSchema.methods.toJSON = function() {
  const token = this.toObject();
  token.id = token._id;
  delete token.__v;
  return token;
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
