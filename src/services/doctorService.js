const Doctor = require('../models/Doctor');
const db = require('../database/db');

class DoctorService {
  /**
   * Create a new doctor
   */
  createDoctor(name, specialization, opdDays = []) {
    const doctor = new Doctor(name, specialization, opdDays);
    db.saveDoctor(doctor);
    return doctor;
  }

  /**
   * Get doctor by ID
   */
  getDoctor(doctorId) {
    const doctor = db.getDoctor(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    return doctor;
  }

  /**
   * Get all doctors
   */
  getAllDoctors() {
    return db.getAllDoctors();
  }

  /**
   * Get doctors by specialization
   */
  getDoctorsBySpecialization(specialization) {
    return db.getAllDoctors().filter(
      doctor => doctor.specialization.toLowerCase() === specialization.toLowerCase()
    );
  }
}

module.exports = new DoctorService();
