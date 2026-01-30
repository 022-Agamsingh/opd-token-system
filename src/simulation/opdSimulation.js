const doctorService = require('../services/doctorService');
const slotService = require('../services/slotService');
const tokenService = require('../services/tokenService');
const db = require('../database/db');

/**
 * OPD Simulation for One Day
 * Simulates a realistic OPD day with 3 doctors
 * Includes all token types and edge cases
 */

class OPDSimulation {
  constructor() {
    this.doctors = [];
    this.slots = [];
    this.tokens = [];
    this.events = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    this.events.push({ timestamp, type, message });
  }

  /**
   * Initialize doctors and slots
   */
  initializeOPD() {
    this.log('=== INITIALIZING OPD SYSTEM ===', 'SYSTEM');
    
    // Create 3 doctors with different specializations
    const dr1 = doctorService.createDoctor(
      'Dr. Rajesh Kumar',
      'Cardiology',
      ['Monday', 'Wednesday', 'Friday']
    );
    
    const dr2 = doctorService.createDoctor(
      'Dr. Priya Sharma',
      'Pediatrics',
      ['Monday', 'Tuesday', 'Thursday']
    );
    
    const dr3 = doctorService.createDoctor(
      'Dr. Amit Patel',
      'General Medicine',
      ['Monday', 'Wednesday', 'Friday']
    );

    this.doctors = [dr1, dr2, dr3];
    
    this.log(`Created doctor: ${dr1.name} (${dr1.specialization})`);
    this.log(`Created doctor: ${dr2.name} (${dr2.specialization})`);
    this.log(`Created doctor: ${dr3.name} (${dr3.specialization})`);

    // Create slots for today (9 AM - 5 PM with 1-hour slots)
    const today = new Date().toISOString().split('T')[0];
    const timeSlots = [
      { start: '09:00', end: '10:00', capacity: 15 },
      { start: '10:00', end: '11:00', capacity: 15 },
      { start: '11:00', end: '12:00', capacity: 15 },
      { start: '12:00', end: '13:00', capacity: 10 }, // Lunch - reduced capacity
      { start: '14:00', end: '15:00', capacity: 15 },
      { start: '15:00', end: '16:00', capacity: 15 },
      { start: '16:00', end: '17:00', capacity: 12 }, // End of day - reduced
    ];

    this.doctors.forEach(doctor => {
      this.log(`\nCreating slots for ${doctor.name}:`);
      timeSlots.forEach(({ start, end, capacity }) => {
        const slot = slotService.createSlot(doctor.id, today, start, end, capacity);
        this.slots.push(slot);
        this.log(`  ${start}-${end} (Capacity: ${capacity})`);
      });
    });

    this.log('\n=== OPD INITIALIZATION COMPLETE ===\n', 'SYSTEM');
  }

  /**
   * Simulate online bookings (before OPD starts)
   */
  simulateOnlineBookings() {
    this.log('=== SIMULATING ONLINE BOOKINGS ===', 'BOOKING');
    
    const onlineBookings = [
      { doctor: 0, slot: 0, patient: 'Ramesh Gupta', id: 'PAT001', phone: '+919876543210' },
      { doctor: 0, slot: 0, patient: 'Sunita Verma', id: 'PAT002', phone: '+919876543211' },
      { doctor: 0, slot: 1, patient: 'Vikram Singh', id: 'PAT003', phone: '+919876543212' },
      { doctor: 1, slot: 0, patient: 'Baby Sharma', id: 'PAT004', phone: '+919876543213' },
      { doctor: 1, slot: 0, patient: 'Aarav Kumar', id: 'PAT005', phone: '+919876543214' },
      { doctor: 1, slot: 1, patient: 'Diya Patel', id: 'PAT006', phone: '+919876543215' },
      { doctor: 2, slot: 0, patient: 'Anita Desai', id: 'PAT007', phone: '+919876543216' },
      { doctor: 2, slot: 0, patient: 'Rajiv Mehta', id: 'PAT008', phone: '+919876543217' },
      { doctor: 2, slot: 1, patient: 'Pooja Jain', id: 'PAT009', phone: '+919876543218' },
      { doctor: 0, slot: 2, patient: 'Harish Rao', id: 'PAT010', phone: '+919876543219' },
    ];

    onlineBookings.forEach(({ doctor, slot, patient, id, phone }) => {
      const slotIndex = doctor * 7 + slot;
      const token = tokenService.bookOnlineToken(
        this.slots[slotIndex].id,
        id,
        patient,
        phone
      );
      this.tokens.push(token);
      this.log(`Online booking: ${patient} -> ${this.doctors[doctor].name} (${token.tokenNumber})`);
    });

    this.log('', 'BOOKING');
  }

  /**
   * Simulate walk-in patients
   */
  simulateWalkins() {
    this.log('=== SIMULATING WALK-IN PATIENTS ===', 'WALKIN');
    
    const walkins = [
      { doctor: 0, slot: 0, patient: 'Walk-in Patient 1', phone: '+919876543220' },
      { doctor: 1, slot: 0, patient: 'Walk-in Patient 2', phone: '+919876543221' },
      { doctor: 2, slot: 1, patient: 'Walk-in Patient 3', phone: '+919876543222' },
      { doctor: 0, slot: 2, patient: 'Walk-in Patient 4', phone: '+919876543223' },
      { doctor: 1, slot: 1, patient: 'Walk-in Patient 5', phone: '+919876543224' },
    ];

    walkins.forEach(({ doctor, slot, patient, phone }) => {
      const slotIndex = doctor * 7 + slot;
      const token = tokenService.generateWalkinToken(
        this.slots[slotIndex].id,
        patient,
        phone
      );
      this.tokens.push(token);
      this.log(`Walk-in: ${patient} -> ${this.doctors[doctor].name} (${token.tokenNumber})`);
    });

    this.log('', 'WALKIN');
  }

  /**
   * Simulate priority (paid) patients
   */
  simulatePriorityPatients() {
    this.log('=== SIMULATING PRIORITY PATIENTS ===', 'PRIORITY');
    
    const priorityPatients = [
      { doctor: 0, slot: 1, patient: 'VIP Patient A', id: 'VIP001', phone: '+919876543225' },
      { doctor: 1, slot: 0, patient: 'VIP Patient B', id: 'VIP002', phone: '+919876543226' },
      { doctor: 2, slot: 2, patient: 'VIP Patient C', id: 'VIP003', phone: '+919876543227' },
    ];

    priorityPatients.forEach(({ doctor, slot, patient, id, phone }) => {
      const slotIndex = doctor * 7 + slot;
      const token = tokenService.generatePriorityToken(
        this.slots[slotIndex].id,
        id,
        patient,
        phone
      );
      this.tokens.push(token);
      this.log(`Priority: ${patient} -> ${this.doctors[doctor].name} (${token.tokenNumber}) - Moved to front!`);
    });

    this.log('', 'PRIORITY');
  }

  /**
   * Simulate follow-up patients
   */
  simulateFollowups() {
    this.log('=== SIMULATING FOLLOW-UP PATIENTS ===', 'FOLLOWUP');
    
    const followups = [
      { doctor: 0, slot: 3, patient: 'Ramesh Gupta', id: 'PAT001', phone: '+919876543210' },
      { doctor: 1, slot: 2, patient: 'Baby Sharma', id: 'PAT004', phone: '+919876543213' },
    ];

    followups.forEach(({ doctor, slot, patient, id, phone }) => {
      const slotIndex = doctor * 7 + slot;
      const token = tokenService.generateFollowupToken(
        this.slots[slotIndex].id,
        id,
        patient,
        phone
      );
      this.tokens.push(token);
      this.log(`Follow-up: ${patient} -> ${this.doctors[doctor].name} (${token.tokenNumber})`);
    });

    this.log('', 'FOLLOWUP');
  }

  /**
   * Simulate emergency cases
   */
  simulateEmergencies() {
    this.log('=== SIMULATING EMERGENCY CASES ===', 'EMERGENCY');
    
    const emergencies = [
      { doctor: 0, slot: 1, patient: 'EMERGENCY - Chest Pain Patient', phone: '+919876543230' },
      { doctor: 2, slot: 0, patient: 'EMERGENCY - Accident Victim', phone: '+919876543231' },
    ];

    emergencies.forEach(({ doctor, slot, patient, phone }) => {
      const slotIndex = doctor * 7 + slot;
      const token = tokenService.insertEmergencyToken(
        this.slots[slotIndex].id,
        patient,
        phone
      );
      this.tokens.push(token);
      this.log(`EMERGENCY: ${patient} -> ${this.doctors[doctor].name} (${token.tokenNumber}) - URGENT!`, 'EMERGENCY');
    });

    this.log('', 'EMERGENCY');
  }

  /**
   * Simulate cancellations
   */
  simulateCancellations() {
    this.log('=== SIMULATING CANCELLATIONS ===', 'CANCEL');
    
    // Cancel 2-3 random tokens
    const cancelCount = 2;
    const tokensToCancel = this.tokens
      .filter(t => t.type === 'ONLINE' || t.type === 'WALKIN')
      .slice(0, cancelCount);

    tokensToCancel.forEach(token => {
      const result = tokenService.cancelToken(token.id, 'Patient cancelled');
      this.log(`Cancelled: Token ${token.tokenNumber} (${token.patientName})`);
      this.log(`  Slot freed up. Queue reordered.`);
    });

    this.log('', 'CANCEL');
  }

  /**
   * Simulate doctor delay
   */
  simulateDoctorDelay() {
    this.log('=== SIMULATING DOCTOR DELAY ===', 'DELAY');
    
    // Dr. Rajesh Kumar is delayed by 30 minutes
    const delayedSlot = this.slots.find(s => 
      s.doctorId === this.doctors[0].id && s.startTime === '10:00'
    );

    if (delayedSlot) {
      slotService.markSlotDelayed(delayedSlot.id, 30);
      this.log(`${this.doctors[0].name} is delayed by 30 minutes for 10:00-11:00 slot`);
      this.log(`All patients in this slot have been notified with updated times`);
    }

    this.log('', 'DELAY');
  }

  /**
   * Simulate no-shows
   */
  simulateNoShows() {
    this.log('=== SIMULATING NO-SHOWS ===', 'NOSHOW');
    
    const noShowToken = this.tokens.find(t => 
      t.type === 'WALKIN' && t.status === 'SCHEDULED'
    );

    if (noShowToken) {
      tokenService.markNoShow(noShowToken.id);
      this.log(`No-show: Token ${noShowToken.tokenNumber} (${noShowToken.patientName})`);
      this.log(`  Slot freed up. Next patient promoted.`);
    }

    this.log('', 'NOSHOW');
  }

  /**
   * Display statistics
   */
  displayStatistics() {
    this.log('\n=== OPD DAY STATISTICS ===', 'STATS');
    
    this.doctors.forEach((doctor, index) => {
      this.log(`\n${doctor.name} (${doctor.specialization}):`);
      
      const doctorSlots = this.slots.filter(s => s.doctorId === doctor.id);
      const totalCapacity = doctorSlots.reduce((sum, s) => sum + s.maxCapacity, 0);
      const totalBooked = doctorSlots.reduce((sum, s) => sum + s.currentCount, 0);
      
      this.log(`  Total Slots: ${doctorSlots.length}`);
      this.log(`  Total Capacity: ${totalCapacity}`);
      this.log(`  Total Booked: ${totalBooked}`);
      this.log(`  Utilization: ${((totalBooked / totalCapacity) * 100).toFixed(2)}%`);
      
      // Sample slot stats
      if (doctorSlots.length > 0) {
        const sampleSlot = doctorSlots[0];
        const stats = slotService.getSlotStats(sampleSlot.id);
        this.log(`\n  Sample Slot (${stats.time}):`);
        this.log(`    Tokens by Type: Emergency=${stats.tokensByType.EMERGENCY}, Priority=${stats.tokensByType.PRIORITY}, Follow-up=${stats.tokensByType.FOLLOWUP}, Online=${stats.tokensByType.ONLINE}, Walk-in=${stats.tokensByType.WALKIN}`);
      }
    });

    // Overall statistics
    this.log('\n=== OVERALL STATISTICS ===');
    this.log(`Total Doctors: ${this.doctors.length}`);
    this.log(`Total Slots: ${this.slots.length}`);
    this.log(`Total Tokens: ${this.tokens.length}`);
    
    const tokensByType = {
      EMERGENCY: this.tokens.filter(t => t.type === 'EMERGENCY').length,
      PRIORITY: this.tokens.filter(t => t.type === 'PRIORITY').length,
      FOLLOWUP: this.tokens.filter(t => t.type === 'FOLLOWUP').length,
      ONLINE: this.tokens.filter(t => t.type === 'ONLINE').length,
      WALKIN: this.tokens.filter(t => t.type === 'WALKIN').length,
    };
    
    this.log(`\nTokens by Type:`);
    Object.entries(tokensByType).forEach(([type, count]) => {
      this.log(`  ${type}: ${count}`);
    });

    const tokensByStatus = {
      SCHEDULED: this.tokens.filter(t => t.status === 'SCHEDULED').length,
      CANCELLED: this.tokens.filter(t => t.status === 'CANCELLED').length,
      NO_SHOW: this.tokens.filter(t => t.status === 'NO_SHOW').length,
    };
    
    this.log(`\nTokens by Status:`);
    Object.entries(tokensByStatus).forEach(([status, count]) => {
      this.log(`  ${status}: ${count}`);
    });
  }

  /**
   * Show sample queues
   */
  displaySampleQueues() {
    this.log('\n=== SAMPLE TOKEN QUEUES ===', 'QUEUE');
    
    // Show queue for first slot of each doctor
    this.doctors.forEach(doctor => {
      const firstSlot = this.slots.find(s => s.doctorId === doctor.id);
      if (firstSlot) {
        const queue = tokenService.getTokenQueue(firstSlot.id);
        this.log(`\n${doctor.name} - ${firstSlot.startTime}-${firstSlot.endTime}:`);
        this.log(`Queue Length: ${queue.length}/${firstSlot.maxCapacity}`);
        
        queue.slice(0, 5).forEach(token => {
          const typeEmoji = {
            EMERGENCY: '🚨',
            PRIORITY: '⭐',
            FOLLOWUP: '🔄',
            ONLINE: '💻',
            WALKIN: '🚶',
          };
          this.log(`  ${token.position}. ${typeEmoji[token.type]} ${token.tokenNumber} - ${token.patientName} (${token.type})`);
        });
        
        if (queue.length > 5) {
          this.log(`  ... and ${queue.length - 5} more patients`);
        }
      }
    });
  }

  /**
   * Run complete simulation
   */
  run() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║     OPD TOKEN ALLOCATION ENGINE - DAY SIMULATION         ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\n');

    try {
      // Clear any existing data
      db.clear();

      // Run simulation phases
      this.initializeOPD();
      
      setTimeout(() => {
        this.simulateOnlineBookings();
        this.simulateWalkins();
        this.simulatePriorityPatients();
        this.simulateFollowups();
        this.simulateEmergencies();
        this.simulateCancellations();
        this.simulateDoctorDelay();
        this.simulateNoShows();
        
        // Display results
        this.displayStatistics();
        this.displaySampleQueues();
        
        this.log('\n=== SIMULATION COMPLETE ===\n', 'SYSTEM');
        
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║  Simulation completed successfully!                     ║');
        console.log('║  Check the logs above for detailed event flow.          ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');
      }, 100);

    } catch (error) {
      this.log(`ERROR: ${error.message}`, 'ERROR');
      console.error(error);
    }
  }
}

// Run simulation
const simulation = new OPDSimulation();
simulation.run();
