const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  opdDays: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  _id: false, // We're using custom _id
});

// Method to match the old class interface
doctorSchema.methods.toJSON = function() {
  const doctor = this.toObject();
  doctor.id = doctor._id;
  delete doctor.__v;
  return doctor;
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
