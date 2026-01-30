const express = require('express');
const slotService = require('../services/slotService');
const { asyncHandler } = require('../middleware/errorHandler');
const validators = require('../middleware/validators');

const router = express.Router();

/**
 * @route   POST /api/slots
 * @desc    Create a new slot
 */
router.post('/', validators.createSlot, asyncHandler(async (req, res) => {
  const { doctorId, date, startTime, endTime, maxCapacity } = req.body;
  
  const slot = await slotService.createSlot(doctorId, date, startTime, endTime, maxCapacity);
  
  res.status(201).json({
    success: true,
    message: 'Slot created successfully',
    data: slot,
  });
}));

/**
 * @route   GET /api/slots/:id
 * @desc    Get slot by ID
 */
router.get('/:id', validators.validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const slot = await slotService.getSlot(id);
  
  res.json({
    success: true,
    data: slot,
  });
}));

/**
 * @route   GET /api/slots/doctor/:doctorId
 * @desc    Get all slots for a doctor
 */
router.get('/doctor/:doctorId', asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  
  const slots = await slotService.getSlotsByDoctor(doctorId, date);
  
  res.json({
    success: true,
    count: slots.length,
    data: slots,
  });
}));

/**
 * @route   GET /api/slots/doctor/:doctorId/available
 * @desc    Get available slots for a doctor
 */
router.get('/doctor/:doctorId/available', asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date parameter is required',
    });
  }
  
  const slots = await slotService.getAvailableSlots(doctorId, date);
  
  res.json({
    success: true,
    count: slots.length,
    data: slots,
  });
}));

/**
 * @route   PATCH /api/slots/:id/delay
 * @desc    Mark slot as delayed
 */
router.patch('/:id/delay', [
  ...validators.validateId,
  ...validators.markSlotDelayed
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { delayMinutes } = req.body;
  
  const slot = await slotService.markSlotDelayed(id, delayMinutes);
  
  res.json({
    success: true,
    message: `Slot marked as delayed by ${delayMinutes} minutes`,
    data: slot,
  });
}));

/**
 * @route   GET /api/slots/:id/stats
 * @desc    Get slot statistics
 */
router.get('/:id/stats', validators.validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const stats = await slotService.getSlotStats(id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

module.exports = router;
