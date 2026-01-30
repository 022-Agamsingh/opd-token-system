// MongoDB database operations using Mongoose
const DoctorModel = require('../models/DoctorModel');
const SlotModel = require('../models/SlotModel');
const TokenModel = require('../models/TokenModel');

class Database {
  constructor() {
    // Waitlist still uses in-memory for real-time operations
    this.waitlist = new Map(); // slotId -> array of tokens
  }

  // Doctor operations
  async saveDoctor(doctor) {
    const doctorData = {
      _id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      opdDays: doctor.opdDays,
      createdAt: doctor.createdAt,
    };
    
    const savedDoctor = await DoctorModel.findByIdAndUpdate(
      doctor.id,
      doctorData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    return this._convertDocToDoctor(savedDoctor);
  }

  async getDoctor(id) {
    const doctor = await DoctorModel.findById(id);
    return doctor ? this._convertDocToDoctor(doctor) : null;
  }

  async getAllDoctors() {
    const doctors = await DoctorModel.find();
    return doctors.map(doc => this._convertDocToDoctor(doc));
  }

  _convertDocToDoctor(doc) {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id;
    return obj;
  }

  // Slot operations
  async saveSlot(slot) {
    const slotData = {
      _id: slot.id,
      doctorId: slot.doctorId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: slot.maxCapacity,
      currentCount: slot.currentCount,
      isDelayed: slot.isDelayed,
      delayMinutes: slot.delayMinutes,
      status: slot.status,
      createdAt: slot.createdAt,
    };
    
    const savedSlot = await SlotModel.findByIdAndUpdate(
      slot.id,
      slotData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    return this._convertDocToSlot(savedSlot);
  }

  async getSlot(id) {
    const slot = await SlotModel.findById(id);
    return slot ? this._convertDocToSlot(slot) : null;
  }

  async getSlotsByDoctor(doctorId) {
    const slots = await SlotModel.find({ doctorId });
    return slots.map(doc => this._convertDocToSlot(doc));
  }

  async getSlotsByDate(date) {
    const slots = await SlotModel.find({ date });
    return slots.map(doc => this._convertDocToSlot(doc));
  }

  async getSlotByDoctorAndTime(doctorId, date, startTime) {
    const slot = await SlotModel.findOne({ doctorId, date, startTime });
    return slot ? this._convertDocToSlot(slot) : null;
  }

  async getAllSlots() {
    const slots = await SlotModel.find();
    return slots.map(doc => this._convertDocToSlot(doc));
  }

  _convertDocToSlot(doc) {
    if (!doc) return null;
    const obj = doc.toObject({ virtuals: true });
    obj.id = obj._id;
    
    // Add virtual getters as properties
    obj.availableCapacity = obj.maxCapacity - obj.currentCount;
    obj.isFull = obj.currentCount >= obj.maxCapacity;
    
    // Add methods
    obj.incrementCount = async () => {
      obj.currentCount++;
      const updated = await SlotModel.findByIdAndUpdate(
        obj.id,
        { currentCount: obj.currentCount },
        { new: true }
      );
      return this._convertDocToSlot(updated);
    };
    
    obj.decrementCount = async () => {
      if (obj.currentCount > 0) {
        obj.currentCount--;
        const updated = await SlotModel.findByIdAndUpdate(
          obj.id,
          { currentCount: obj.currentCount },
          { new: true }
        );
        return this._convertDocToSlot(updated);
      }
    };
    
    obj.markDelayed = async (minutes) => {
      const updated = await SlotModel.findByIdAndUpdate(
        obj.id,
        { isDelayed: true, delayMinutes: minutes, status: 'DELAYED' },
        { new: true }
      );
      return this._convertDocToSlot(updated);
    };
    
    return obj;
  }

  // Token operations
  async saveToken(token) {
    const tokenData = {
      _id: token.id,
      tokenNumber: token.tokenNumber,
      patientId: token.patientId,
      patientName: token.patientName,
      slotId: token.slotId,
      type: token.type,
      priority: token.priority,
      queuePosition: token.queuePosition,
      estimatedTime: token.estimatedTime,
      status: token.status,
      checkInTime: token.checkInTime,
      completedTime: token.completedTime,
      createdAt: token.createdAt,
    };
    
    const savedToken = await TokenModel.findByIdAndUpdate(
      token.id,
      tokenData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    return this._convertDocToToken(savedToken);
  }

  async getToken(id) {
    const token = await TokenModel.findById(id);
    return token ? this._convertDocToToken(token) : null;
  }

  async getTokensBySlot(slotId) {
    const tokens = await TokenModel.find({ slotId });
    return tokens.map(doc => this._convertDocToToken(doc));
  }

  async getTokensByPatient(patientId) {
    const tokens = await TokenModel.find({ patientId });
    return tokens.map(doc => this._convertDocToToken(doc));
  }

  async getAllTokens() {
    const tokens = await TokenModel.find();
    return tokens.map(doc => this._convertDocToToken(doc));
  }

  async deleteToken(id) {
    await TokenModel.findByIdAndDelete(id);
  }

  _convertDocToToken(doc) {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id;
    
    // Add methods
    obj.updateStatus = async (status, additionalData = {}) => {
      const updateData = { status, ...additionalData };
      
      if (status === 'CHECKED_IN' && !obj.checkInTime) {
        updateData.checkInTime = new Date();
      }
      
      if (status === 'COMPLETED' && !obj.completedTime) {
        updateData.completedTime = new Date();
      }
      
      const updated = await TokenModel.findByIdAndUpdate(
        obj.id,
        updateData,
        { new: true }
      );
      return this._convertDocToToken(updated);
    };
    
    obj.updateQueuePosition = async (position) => {
      const updated = await TokenModel.findByIdAndUpdate(
        obj.id,
        { queuePosition: position },
        { new: true }
      );
      return this._convertDocToToken(updated);
    };
    
    return obj;
  }

  // Waitlist operations (in-memory for real-time performance)
  addToWaitlist(slotId, token) {
    if (!this.waitlist.has(slotId)) {
      this.waitlist.set(slotId, []);
    }
    this.waitlist.get(slotId).push(token);
  }

  getWaitlist(slotId) {
    return this.waitlist.get(slotId) || [];
  }

  removeFromWaitlist(slotId, tokenId) {
    if (this.waitlist.has(slotId)) {
      const list = this.waitlist.get(slotId);
      const index = list.findIndex(t => t.id === tokenId);
      if (index > -1) {
        list.splice(index, 1);
      }
    }
  }

  // Utility
  async clear() {
    await Promise.all([
      DoctorModel.deleteMany({}),
      SlotModel.deleteMany({}),
      TokenModel.deleteMany({}),
    ]);
    this.waitlist.clear();
  }
}

// Singleton instance
const db = new Database();

module.exports = db;

