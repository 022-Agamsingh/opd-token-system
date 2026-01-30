const { v4: uuidv4 } = require('uuid');

class Doctor {
  constructor(name, specialization, opdDays = []) {
    this.id = uuidv4();
    this.name = name;
    this.specialization = specialization;
    this.opdDays = opdDays; // Array of day strings: ['Monday', 'Wednesday', 'Friday']
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      specialization: this.specialization,
      opdDays: this.opdDays,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Doctor;
