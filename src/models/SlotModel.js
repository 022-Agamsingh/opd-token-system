const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'Doctor',
    index: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1,
  },
  currentCount: {
    type: Number,
    default: 0,
  },
  isDelayed: {
    type: Boolean,
    default: false,
  },
  delayMinutes: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DELAYED', 'CANCELLED', 'COMPLETED'],
    default: 'ACTIVE',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  _id: false,
});

// Compound index for unique doctor slots
slotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

// Virtual fields
slotSchema.virtual('availableCapacity').get(function() {
  return this.maxCapacity - this.currentCount;
});

slotSchema.virtual('isFull').get(function() {
  return this.currentCount >= this.maxCapacity;
});

// Methods
slotSchema.methods.incrementCount = function() {
  this.currentCount++;
  return this.save();
};

slotSchema.methods.decrementCount = function() {
  if (this.currentCount > 0) {
    this.currentCount--;
    return this.save();
  }
};

slotSchema.methods.markDelayed = function(minutes) {
  this.isDelayed = true;
  this.delayMinutes = minutes;
  this.status = 'DELAYED';
  return this.save();
};

slotSchema.methods.toJSON = function() {
  const slot = this.toObject({ virtuals: true });
  slot.id = slot._id;
  delete slot.__v;
  return slot;
};

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
