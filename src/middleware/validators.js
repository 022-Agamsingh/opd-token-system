const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const validators = {
  // Token booking validation
  bookToken: [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    handleValidationErrors,
  ],

  // Walk-in token validation
  walkinToken: [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    handleValidationErrors,
  ],

  // Priority token validation
  priorityToken: [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    handleValidationErrors,
  ],

  // Emergency token validation
  emergencyToken: [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required for emergency'),
    handleValidationErrors,
  ],

  // Slot creation validation
  createSlot: [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('date').isDate().withMessage('Valid date is required (YYYY-MM-DD)'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time required (HH:MM)'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid end time required (HH:MM)'),
    body('maxCapacity').isInt({ min: 1 }).withMessage('Max capacity must be at least 1'),
    handleValidationErrors,
  ],

  // Doctor creation validation
  createDoctor: [
    body('name').notEmpty().withMessage('Doctor name is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('opdDays').optional().isArray().withMessage('OPD days must be an array'),
    handleValidationErrors,
  ],

  // Token status update validation
  updateTokenStatus: [
    body('status')
      .isIn(['SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
      .withMessage('Invalid status'),
    handleValidationErrors,
  ],

  // Slot delay validation
  markSlotDelayed: [
    body('delayMinutes').isInt({ min: 1 }).withMessage('Delay must be at least 1 minute'),
    handleValidationErrors,
  ],

  // ID parameter validation
  validateId: [
    param('id').notEmpty().withMessage('ID parameter is required'),
    handleValidationErrors,
  ],
};

module.exports = validators;
