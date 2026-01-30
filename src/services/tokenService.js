const Token = require('../models/Token');
const db = require('../database/db');
const slotService = require('./slotService');
const config = require('../config/config');

class TokenService {
  /**
   * Core Token Allocation Algorithm
   * Enforces slot limits, handles priorities, and manages edge cases
   */
  async allocateToken(slotId, patientId, patientName, type, phoneNumber = null) {
    // Validate slot
    const slot = await slotService.getSlot(slotId);
    
    // Check if slot is full
    if (slot.isFull) {
      throw new Error('Slot is full. Token cannot be allocated.');
    }

    // Create token
    const token = new Token(slotId, patientId, patientName, type, phoneNumber);
    
    // Assign token number based on priority
    await this._assignTokenNumber(token, slotId);
    
    // Update slot capacity
    await slotService.updateSlotCapacity(slotId, true);
    
    // Calculate estimated time
    await this._calculateEstimatedTime(token);
    
    // Save token
    await db.saveToken(token);
    
    return token;
  }

  /**
   * Assign token number based on priority queue
   */
  async _assignTokenNumber(newToken, slotId) {
    const existingTokens = (await db.getTokensBySlot(slotId))
      .filter(t => t.status !== config.tokenStatus.CANCELLED && 
                   t.status !== config.tokenStatus.NO_SHOW);
    
    // Add new token to list
    existingTokens.push(newToken);
    
    // Sort by priority score (higher first)
    existingTokens.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Assign positions and token numbers
    existingTokens.forEach((token, index) => {
      token.position = index + 1;
      token.tokenNumber = `T${String(index + 1).padStart(3, '0')}`;
    });
  }

  /**
   * Calculate estimated time for patient
   */
  async _calculateEstimatedTime(token) {
    const slot = await slotService.getSlot(token.slotId);
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    
    // Average consultation time: 10 minutes
    const avgConsultationTime = 10;
    const estimatedMinutes = (token.position - 1) * avgConsultationTime;
    
    const estimatedDate = new Date(slot.date);
    estimatedDate.setHours(hours, minutes + estimatedMinutes);
    
    // Add delay if slot is delayed
    if (slot.isDelayed) {
      estimatedDate.setMinutes(estimatedDate.getMinutes() + slot.delayMinutes);
    }
    
    token.estimatedTime = estimatedDate;
  }

  /**
   * Book online token
   */
  async bookOnlineToken(slotId, patientId, patientName, phoneNumber) {
    return await this.allocateToken(slotId, patientId, patientName, config.tokenTypes.ONLINE, phoneNumber);
  }

  /**
   * Generate walk-in token
   */
  async generateWalkinToken(slotId, patientName, phoneNumber) {
    const patientId = `WALKIN-${Date.now()}`;
    return await this.allocateToken(slotId, patientId, patientName, config.tokenTypes.WALKIN, phoneNumber);
  }

  /**
   * Generate priority token (paid)
   */
  async generatePriorityToken(slotId, patientId, patientName, phoneNumber) {
    return await this.allocateToken(slotId, patientId, patientName, config.tokenTypes.PRIORITY, phoneNumber);
  }

  /**
   * Generate follow-up token
   */
  async generateFollowupToken(slotId, patientId, patientName, phoneNumber) {
    return await this.allocateToken(slotId, patientId, patientName, config.tokenTypes.FOLLOWUP, phoneNumber);
  }

  /**
   * Insert emergency token
   * Emergency tokens get highest priority and may cause reallocation
   */
  async insertEmergencyToken(slotId, patientName, phoneNumber) {
    const patientId = `EMERGENCY-${Date.now()}`;
    const slot = await slotService.getSlot(slotId);
    
    // If slot is full, try to reallocate or extend capacity
    if (slot.isFull) {
      // For emergencies, we can temporarily extend capacity by 1
      console.log(`EMERGENCY: Extending slot ${slotId} capacity for emergency case`);
      slot.maxCapacity += 1;
      await db.saveSlot(slot);
    }
    
    const token = await this.allocateToken(slotId, patientId, patientName, config.tokenTypes.EMERGENCY, phoneNumber);
    
    // Re-sort all tokens in the slot to push emergency to front
    await this._reorderSlotTokens(slotId);
    
    return token;
  }

  /**
   * Reorder all tokens in a slot based on priority
   */
  async _reorderSlotTokens(slotId) {
    const tokens = (await db.getTokensBySlot(slotId))
      .filter(t => t.status === config.tokenStatus.SCHEDULED || 
                   t.status === config.tokenStatus.WAITING);
    
    // Sort by priority
    tokens.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Reassign positions and recalculate times
    for (const token of tokens) {
      token.position = tokens.indexOf(token) + 1;
      token.tokenNumber = `T${String(tokens.indexOf(token) + 1).padStart(3, '0')}`;
      await this._calculateEstimatedTime(token);
      await db.saveToken(token);
    }
  }

  /**
   * Cancel token
   */
  async cancelToken(tokenId, reason = 'Patient cancelled') {
    const token = await db.getToken(tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    if (token.status === config.tokenStatus.CANCELLED) {
      throw new Error('Token already cancelled');
    }

    if (token.status === config.tokenStatus.COMPLETED) {
      throw new Error('Cannot cancel completed token');
    }

    // Mark as cancelled
    token.markCancelled();
    await db.saveToken(token);

    // Free up slot capacity
    await slotService.updateSlotCapacity(token.slotId, false);

    // Reorder remaining tokens
    await this._reorderSlotTokens(token.slotId);

    // Try to promote from waitlist
    await this._promoteFromWaitlist(token.slotId);

    return { token, reason };
  }

  /**
   * Mark token as no-show
   */
  async markNoShow(tokenId) {
    const token = await db.getToken(tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    token.markNoShow();
    await db.saveToken(token);

    // Free up slot capacity
    await slotService.updateSlotCapacity(token.slotId, false);

    // Reorder remaining tokens
    await this._reorderSlotTokens(token.slotId);

    // Try to promote from waitlist
    await this._promoteFromWaitlist(token.slotId);

    return token;
  }

  /**
   * Promote token from waitlist if slot has capacity
   */
  async _promoteFromWaitlist(slotId) {
    const waitlist = db.getWaitlist(slotId);
    const slot = await slotService.getSlot(slotId);

    if (waitlist.length > 0 && !slot.isFull) {
      const promotedToken = waitlist[0];
      promotedToken.status = config.tokenStatus.SCHEDULED;
      
      // Assign token number
      await this._assignTokenNumber(promotedToken, slotId);
      await this._calculateEstimatedTime(promotedToken);
      
      await db.saveToken(promotedToken);
      await slotService.updateSlotCapacity(slotId, true);
      db.removeFromWaitlist(slotId, promotedToken.id);

      console.log(`Promoted token ${promotedToken.id} from waitlist to slot ${slotId}`);
    }
  }

  /**
   * Dynamic reallocation when slot conditions change
   */
  async reallocateTokens(slotId, reason = 'doctor_delay') {
    const tokens = (await db.getTokensBySlot(slotId))
      .filter(t => t.status === config.tokenStatus.SCHEDULED);

    if (tokens.length === 0) {
      return { reallocated: [], message: 'No tokens to reallocate' };
    }

    const slot = await slotService.getSlot(slotId);
    const doctor = await db.getDoctor(slot.doctorId);

    // Find next available slot for same doctor
    const nextSlot = await slotService.getNextAvailableSlot(slot.doctorId, slot.date, slot.startTime);

    if (!nextSlot) {
      throw new Error('No available slots for reallocation');
    }

    const reallocatedTokens = [];
    const tokensToMove = tokens.slice(nextSlot.availableCapacity);

    for (const token of tokensToMove) {
      // Update token slot
      token.relocate(nextSlot.id);
      await this._assignTokenNumber(token, nextSlot.id);
      await this._calculateEstimatedTime(token);
      await db.saveToken(token);

      // Update capacities
      await slotService.updateSlotCapacity(slotId, false);
      await slotService.updateSlotCapacity(nextSlot.id, true);

      reallocatedTokens.push(token);
    }

    return {
      reallocated: reallocatedTokens,
      fromSlot: slot,
      toSlot: nextSlot,
      reason,
    };
  }

  /**
   * Get token queue for a slot
   */
  async getTokenQueue(slotId) {
    const tokens = (await db.getTokensBySlot(slotId))
      .filter(t => t.status !== config.tokenStatus.CANCELLED && 
                   t.status !== config.tokenStatus.NO_SHOW &&
                   t.status !== config.tokenStatus.COMPLETED);

    // Sort by position
    tokens.sort((a, b) => a.position - b.position);

    return tokens;
  }

  /**
   * Update token status
   */
  async updateTokenStatus(tokenId, status) {
    const token = await db.getToken(tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    switch (status) {
      case config.tokenStatus.IN_PROGRESS:
        token.markStarted();
        break;
      case config.tokenStatus.COMPLETED:
        token.markCompleted();
        break;
      case config.tokenStatus.CANCELLED:
        return await this.cancelToken(tokenId);
      case config.tokenStatus.NO_SHOW:
        return await this.markNoShow(tokenId);
      default:
        token.updateStatus(status);
    }

    await db.saveToken(token);
    return token;
  }

  /**
   * Get token by ID
   */
  async getToken(tokenId) {
    const token = await db.getToken(tokenId);
    if (!token) {
      throw new Error('Token not found');
    }
    return token;
  }

  /**
   * Get tokens by patient
   */
  async getTokensByPatient(patientId) {
    return await db.getTokensByPatient(patientId);
  }
}

module.exports = new TokenService();
