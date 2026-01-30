const Slot = require('../models/Slot');
const db = require('../database/db');
const config = require('../config/config');

class SlotService {
  /**
   * Helper function to convert time string to minutes
   */
  _timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper function to convert minutes to time string
   */
  _minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Create multiple 10-minute slots for a doctor within a time range
   */
  async createSlot(doctorId, date, startTime, endTime, maxCapacity) {
    // Check if doctor exists
    const doctor = await db.getDoctor(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Convert time to minutes
    const startMinutes = this._timeToMinutes(startTime);
    const endMinutes = this._timeToMinutes(endTime);
    const slotDuration = config.slotDuration || 10; // Default 10 minutes

    if (endMinutes <= startMinutes) {
      throw new Error('End time must be after start time');
    }

    const createdSlots = [];
    let currentStart = startMinutes;

    // Create 10-minute slots
    while (currentStart < endMinutes) {
      const currentEnd = currentStart + slotDuration;
      
      // Don't create slot if it exceeds the end time
      if (currentEnd > endMinutes) {
        break;
      }

      const slotStartTime = this._minutesToTime(currentStart);
      const slotEndTime = this._minutesToTime(currentEnd);

      // Check if slot already exists
      const existingSlot = await db.getSlotByDoctorAndTime(doctorId, date, slotStartTime);
      if (!existingSlot) {
        const slot = new Slot(doctorId, date, slotStartTime, slotEndTime, maxCapacity);
        await db.saveSlot(slot);
        createdSlots.push(slot);
      } else {
        console.log(`Slot already exists: ${slotStartTime}-${slotEndTime}`);
      }

      currentStart = currentEnd;
    }

    if (createdSlots.length === 0) {
      throw new Error('No new slots created - all slots already exist for this time range');
    }

    return {
      message: `Created ${createdSlots.length} slots`,
      count: createdSlots.length,
      slots: createdSlots
    };
  }

  /**
   * Get slot by ID
   */
  async getSlot(slotId) {
    const slot = await db.getSlot(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }
    return slot;
  }

  /**
   * Get all slots for a doctor
   */
  async getSlotsByDoctor(doctorId, date = null) {
    let slots = await db.getSlotsByDoctor(doctorId);
    
    if (date) {
      slots = slots.filter(slot => slot.date === date);
    }
    
    return slots.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Get available slots (not full and active)
   */
  async getAvailableSlots(doctorId, date) {
    const slots = await this.getSlotsByDoctor(doctorId, date);
    return slots.filter(slot => !slot.isFull && slot.status === 'ACTIVE');
  }

  /**
   * Check if slot has capacity
   */
  async hasCapacity(slotId) {
    const slot = await this.getSlot(slotId);
    return !slot.isFull;
  }

  /**
   * Mark slot as delayed
   */
  async markSlotDelayed(slotId, delayMinutes) {
    const slot = await this.getSlot(slotId);
    slot.markDelayed(delayMinutes);
    await db.saveSlot(slot);
    
    return slot;
  }

  /**
   * Get next available slot for a doctor
   */
  async getNextAvailableSlot(doctorId, afterDate, afterTime) {
    const slots = await db.getSlotsByDoctor(doctorId);
    
    const availableSlots = slots.filter(slot => {
      if (slot.isFull || slot.status !== 'ACTIVE') return false;
      
      if (slot.date > afterDate) return true;
      if (slot.date === afterDate && slot.startTime > afterTime) return true;
      
      return false;
    });

    if (availableSlots.length === 0) return null;

    return availableSlots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })[0];
  }

  /**
   * Update slot capacity
   */
  async updateSlotCapacity(slotId, increment = true) {
    const slot = await this.getSlot(slotId);
    
    if (increment) {
      slot.incrementCount();
    } else {
      slot.decrementCount();
    }
    
    await db.saveSlot(slot);
    return slot;
  }

  /**
   * Get slot statistics
   */
  async getSlotStats(slotId) {
    const slot = await this.getSlot(slotId);
    const tokens = await db.getTokensBySlot(slotId);
    
    const stats = {
      slotId: slot.id,
      doctorId: slot.doctorId,
      date: slot.date,
      time: `${slot.startTime}-${slot.endTime}`,
      maxCapacity: slot.maxCapacity,
      currentCount: slot.currentCount,
      availableCapacity: slot.availableCapacity,
      utilizationRate: ((slot.currentCount / slot.maxCapacity) * 100).toFixed(2) + '%',
      tokensByType: {
        EMERGENCY: tokens.filter(t => t.type === 'EMERGENCY').length,
        PRIORITY: tokens.filter(t => t.type === 'PRIORITY').length,
        FOLLOWUP: tokens.filter(t => t.type === 'FOLLOWUP').length,
        ONLINE: tokens.filter(t => t.type === 'ONLINE').length,
        WALKIN: tokens.filter(t => t.type === 'WALKIN').length,
      },
      tokensByStatus: {
        SCHEDULED: tokens.filter(t => t.status === 'SCHEDULED').length,
        WAITING: tokens.filter(t => t.status === 'WAITING').length,
        IN_PROGRESS: tokens.filter(t => t.status === 'IN_PROGRESS').length,
        COMPLETED: tokens.filter(t => t.status === 'COMPLETED').length,
        CANCELLED: tokens.filter(t => t.status === 'CANCELLED').length,
        NO_SHOW: tokens.filter(t => t.status === 'NO_SHOW').length,
      }
    };
    
    return stats;
  }
}

module.exports = new SlotService();
