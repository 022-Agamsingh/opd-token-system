const { v4: uuidv4 } = require('uuid');

class Slot {
  constructor(doctorId, date, startTime, endTime, maxCapacity) {
    this.id = uuidv4();
    this.doctorId = doctorId;
    this.date = date; // YYYY-MM-DD
    this.startTime = startTime; // HH:MM
    this.endTime = endTime; // HH:MM
    this.maxCapacity = maxCapacity;
    this.currentCount = 0;
    this.isDelayed = false;
    this.delayMinutes = 0;
    this.status = 'ACTIVE'; // ACTIVE, DELAYED, CANCELLED, COMPLETED
    this.createdAt = new Date();
  }

  get availableCapacity() {
    return this.maxCapacity - this.currentCount;
  }

  get isFull() {
    return this.currentCount >= this.maxCapacity;
  }

  incrementCount() {
    this.currentCount++;
  }

  decrementCount() {
    if (this.currentCount > 0) {
      this.currentCount--;
    }
  }

  markDelayed(minutes) {
    this.isDelayed = true;
    this.delayMinutes = minutes;
    this.status = 'DELAYED';
  }

  toJSON() {
    return {
      id: this.id,
      doctorId: this.doctorId,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      maxCapacity: this.maxCapacity,
      currentCount: this.currentCount,
      availableCapacity: this.availableCapacity,
      isFull: this.isFull,
      isDelayed: this.isDelayed,
      delayMinutes: this.delayMinutes,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Slot;
