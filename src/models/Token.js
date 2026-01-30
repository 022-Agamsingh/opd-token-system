const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class Token {
  constructor(slotId, patientId, patientName, type, phoneNumber = null) {
    this.id = uuidv4();
    this.slotId = slotId;
    this.patientId = patientId;
    this.patientName = patientName;
    this.phoneNumber = phoneNumber;
    this.type = type; // ONLINE, WALKIN, PRIORITY, FOLLOWUP, EMERGENCY
    this.tokenNumber = null; // Will be assigned by allocation logic
    this.priorityScore = this.calculatePriorityScore(type);
    this.status = config.tokenStatus.SCHEDULED;
    this.bookedAt = new Date();
    this.estimatedTime = null;
    this.actualStartTime = null;
    this.actualEndTime = null;
    this.position = null; // Position in queue
    this.isRelocated = false;
    this.originalSlotId = null;
  }

  calculatePriorityScore(type) {
    const baseScore = config.priority[type] || config.priority.WALKIN;
    // Add timestamp factor (earlier bookings get slight advantage within same priority)
    const timeFactor = Date.now() / 1000000000; // Small time-based component
    return baseScore + timeFactor;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  markStarted() {
    this.status = config.tokenStatus.IN_PROGRESS;
    this.actualStartTime = new Date();
  }

  markCompleted() {
    this.status = config.tokenStatus.COMPLETED;
    this.actualEndTime = new Date();
  }

  markCancelled() {
    this.status = config.tokenStatus.CANCELLED;
  }

  markNoShow() {
    this.status = config.tokenStatus.NO_SHOW;
  }

  relocate(newSlotId) {
    if (!this.originalSlotId) {
      this.originalSlotId = this.slotId;
    }
    this.slotId = newSlotId;
    this.isRelocated = true;
  }

  toJSON() {
    return {
      id: this.id,
      slotId: this.slotId,
      patientId: this.patientId,
      patientName: this.patientName,
      phoneNumber: this.phoneNumber,
      type: this.type,
      tokenNumber: this.tokenNumber,
      priorityScore: this.priorityScore,
      status: this.status,
      bookedAt: this.bookedAt,
      estimatedTime: this.estimatedTime,
      actualStartTime: this.actualStartTime,
      actualEndTime: this.actualEndTime,
      position: this.position,
      isRelocated: this.isRelocated,
      originalSlotId: this.originalSlotId,
    };
  }
}

module.exports = Token;
