const express = require('express');
const tokenService = require('../services/tokenService');
const { asyncHandler } = require('../middleware/errorHandler');
const validators = require('../middleware/validators');

const router = express.Router();

/**
 * @route   POST /api/tokens/book
 * @desc    Book an online token
 */
router.post('/book', validators.bookToken, asyncHandler(async (req, res) => {
  const { slotId, patientId, patientName, phoneNumber } = req.body;
  
  const token = await tokenService.bookOnlineToken(slotId, patientId, patientName, phoneNumber);
  
  res.status(201).json({
    success: true,
    message: 'Token booked successfully',
    data: token,
  });
}));

/**
 * @route   POST /api/tokens/walkin
 * @desc    Generate walk-in token
 */
router.post('/walkin', validators.walkinToken, asyncHandler(async (req, res) => {
  const { slotId, patientName, phoneNumber } = req.body;
  
  const token = await tokenService.generateWalkinToken(slotId, patientName, phoneNumber);
  
  res.status(201).json({
    success: true,
    message: 'Walk-in token generated successfully',
    data: token,
  });
}));

/**
 * @route   POST /api/tokens/priority
 * @desc    Generate priority (paid) token
 */
router.post('/priority', validators.priorityToken, asyncHandler(async (req, res) => {
  const { slotId, patientId, patientName, phoneNumber } = req.body;
  
  const token = await tokenService.generatePriorityToken(slotId, patientId, patientName, phoneNumber);
  
  res.status(201).json({
    success: true,
    message: 'Priority token generated successfully',
    data: token,
  });
}));

/**
 * @route   POST /api/tokens/followup
 * @desc    Generate follow-up token
 */
router.post('/followup', validators.bookToken, asyncHandler(async (req, res) => {
  const { slotId, patientId, patientName, phoneNumber } = req.body;
  
  const token = await tokenService.generateFollowupToken(slotId, patientId, patientName, phoneNumber);
  
  res.status(201).json({
    success: true,
    message: 'Follow-up token generated successfully',
    data: token,
  });
}));

/**
 * @route   POST /api/tokens/emergency
 * @desc    Insert emergency token
 */
router.post('/emergency', validators.emergencyToken, asyncHandler(async (req, res) => {
  const { slotId, patientName, phoneNumber } = req.body;
  
  const token = await tokenService.insertEmergencyToken(slotId, patientName, phoneNumber);
  
  res.status(201).json({
    success: true,
    message: 'Emergency token inserted successfully',
    data: token,
  });
}));

/**
 * @route   DELETE /api/tokens/:id/cancel
 * @desc    Cancel a token
 */
router.delete('/:id/cancel', validators.validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const result = await tokenService.cancelToken(id, reason);
  
  res.json({
    success: true,
    message: 'Token cancelled successfully',
    data: result,
  });
}));

/**
 * @route   PATCH /api/tokens/:id/status
 * @desc    Update token status
 */
router.patch('/:id/status', [
  ...validators.validateId,
  ...validators.updateTokenStatus
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const token = await tokenService.updateTokenStatus(id, status);
  
  res.json({
    success: true,
    message: 'Token status updated successfully',
    data: token,
  });
}));

/**
 * @route   GET /api/tokens/:id
 * @desc    Get token by ID
 */
router.get('/:id', validators.validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const token = await tokenService.getToken(id);
  
  res.json({
    success: true,
    data: token,
  });
}));

/**
 * @route   GET /api/tokens/patient/:patientId
 * @desc    Get all tokens for a patient
 */
router.get('/patient/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  const tokens = await tokenService.getTokensByPatient(patientId);
  
  res.json({
    success: true,
    count: tokens.length,
    data: tokens,
  });
}));

/**
 * @route   GET /api/tokens/queue/:slotId
 * @desc    Get token queue for a slot
 */
router.get('/queue/:slotId', asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  
  const queue = await tokenService.getTokenQueue(slotId);
  
  res.json({
    success: true,
    count: queue.length,
    data: queue,
  });
}));

/**
 * @route   POST /api/tokens/reallocate/:slotId
 * @desc    Reallocate tokens from a slot
 */
router.post('/reallocate/:slotId', asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { reason } = req.body;
  
  const result = await tokenService.reallocateTokens(slotId, reason);
  
  res.json({
    success: true,
    message: 'Tokens reallocated successfully',
    data: result,
  });
}));

module.exports = router;
