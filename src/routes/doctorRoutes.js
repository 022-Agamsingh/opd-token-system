const express = require('express');
const doctorService = require('../services/doctorService');
const { asyncHandler } = require('../middleware/errorHandler');
const validators = require('../middleware/validators');

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor
 */
router.post('/', validators.createDoctor, asyncHandler(async (req, res) => {
  const { name, specialization, opdDays } = req.body;
  
  const doctor = doctorService.createDoctor(name, specialization, opdDays);
  
  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: doctor,
  });
}));

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 */
router.get('/', asyncHandler(async (req, res) => {
  const { specialization } = req.query;
  
  let doctors;
  if (specialization) {
    doctors = doctorService.getDoctorsBySpecialization(specialization);
  } else {
    doctors = doctorService.getAllDoctors();
  }
  
  res.json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
}));

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 */
router.get('/:id', validators.validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const doctor = doctorService.getDoctor(id);
  
  res.json({
    success: true,
    data: doctor,
  });
}));

module.exports = router;
