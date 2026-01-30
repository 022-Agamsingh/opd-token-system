# OPD Token Allocation Engine

A sophisticated token allocation system for hospital Out-Patient Department (OPD) that supports elastic capacity management, dynamic reallocation, and priority-based queuing.

## 🏥 Features

- **Multi-source Token Generation**: Online booking, Walk-in, Priority (Paid), Follow-up, Emergency
- **Dynamic Priority System**: Automatic token ordering based on priority scores
- **Elastic Capacity Management**: Handles slot delays, cancellations, and emergency insertions
- **Real-time Reallocation**: Automatically redistributes tokens when conditions change
- **Edge Case Handling**: No-shows, cancellations, doctor delays, emergency cases
- **Comprehensive API**: RESTful endpoints for all operations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd opd-token-system

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Run Simulation

```bash
npm run simulate
```

This will run a complete OPD day simulation with 3 doctors, demonstrating all features and edge cases.

## 📡 API Endpoints

### Doctors

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| POST   | `/api/doctors`                           | Create a new doctor      |
| GET    | `/api/doctors`                           | Get all doctors          |
| GET    | `/api/doctors/:id`                       | Get doctor by ID         |
| GET    | `/api/doctors?specialization=Cardiology` | Filter by specialization |

### Slots

| Method | Endpoint                                                | Description                |
| ------ | ------------------------------------------------------- | -------------------------- |
| POST   | `/api/slots`                                            | Create a new slot          |
| GET    | `/api/slots/:id`                                        | Get slot by ID             |
| GET    | `/api/slots/doctor/:doctorId`                           | Get all slots for a doctor |
| GET    | `/api/slots/doctor/:doctorId/available?date=YYYY-MM-DD` | Get available slots        |
| PATCH  | `/api/slots/:id/delay`                                  | Mark slot as delayed       |
| GET    | `/api/slots/:id/stats`                                  | Get slot statistics        |

### Tokens

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/api/tokens/book`               | Book an online token           |
| POST   | `/api/tokens/walkin`             | Generate walk-in token         |
| POST   | `/api/tokens/priority`           | Generate priority (paid) token |
| POST   | `/api/tokens/followup`           | Generate follow-up token       |
| POST   | `/api/tokens/emergency`          | Insert emergency token         |
| GET    | `/api/tokens/:id`                | Get token by ID                |
| GET    | `/api/tokens/patient/:patientId` | Get all tokens for a patient   |
| GET    | `/api/tokens/queue/:slotId`      | Get token queue for a slot     |
| PATCH  | `/api/tokens/:id/status`         | Update token status            |
| DELETE | `/api/tokens/:id/cancel`         | Cancel a token                 |
| POST   | `/api/tokens/reallocate/:slotId` | Reallocate tokens from a slot  |

## 📝 API Usage Examples

### 1. Create a Doctor

```bash
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "specialization": "Cardiology",
    "opdDays": ["Monday", "Wednesday", "Friday"]
  }'
```

### 2. Create a Slot

```bash
curl -X POST http://localhost:3000/api/slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "doctor-uuid",
    "date": "2026-01-31",
    "startTime": "09:00",
    "endTime": "10:00",
    "maxCapacity": 20
  }'
```

### 3. Book Online Token

```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-uuid",
    "patientId": "PAT001",
    "patientName": "John Doe",
    "phoneNumber": "+919876543210"
  }'
```

### 4. Generate Walk-in Token

```bash
curl -X POST http://localhost:3000/api/tokens/walkin \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-uuid",
    "patientName": "Jane Smith",
    "phoneNumber": "+919876543211"
  }'
```

### 5. Insert Emergency Token

```bash
curl -X POST http://localhost:3000/api/tokens/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-uuid",
    "patientName": "Emergency Patient",
    "phoneNumber": "+919876543212"
  }'
```

### 6. Get Token Queue

```bash
curl http://localhost:3000/api/tokens/queue/slot-uuid
```

### 7. Cancel Token

```bash
curl -X DELETE http://localhost:3000/api/tokens/token-uuid/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Patient cancelled appointment"
  }'
```

### 8. Mark Slot as Delayed

```bash
curl -X PATCH http://localhost:3000/api/slots/slot-uuid/delay \
  -H "Content-Type: application/json" \
  -d '{
    "delayMinutes": 30
  }'
```

## 🔧 Configuration

Edit `.env` file to configure:

```env
PORT=3000
NODE_ENV=development

# Slot Configuration
DEFAULT_SLOT_DURATION=60
DEFAULT_MAX_CAPACITY=20

# Priority Weights
EMERGENCY_PRIORITY=1000
PAID_PRIORITY=500
FOLLOWUP_PRIORITY=300
ONLINE_PRIORITY=200
WALKIN_PRIORITY=100

# Timeouts (in minutes)
NO_SHOW_TIMEOUT=15
LATE_ARRIVAL_GRACE=10
```

## 🧮 Token Allocation Algorithm

### Priority Scoring

Each token is assigned a priority score:

```
Priority Score = Base Priority + Time Factor

Base Priorities:
- EMERGENCY: 1000
- PRIORITY (Paid): 500
- FOLLOWUP: 300
- ONLINE: 200
- WALKIN: 100
```

### Allocation Logic

1. **Check Slot Capacity**: Verify slot has available capacity
2. **Create Token**: Initialize token with patient details
3. **Calculate Priority**: Assign priority score based on token type
4. **Sort Queue**: Reorder all tokens in slot by priority (highest first)
5. **Assign Position**: Give each token a position and token number
6. **Calculate ETA**: Estimate consultation time based on position
7. **Update Slot**: Increment slot's current count

### Dynamic Reallocation

When slots are affected by delays or changes:

1. Identify affected tokens
2. Find next available slot for same doctor
3. Move tokens that don't fit
4. Recalculate positions and ETAs
5. Notify affected patients

## 🎯 Edge Cases Handled

### 1. Slot Full

- New bookings are rejected
- Emergency cases can extend capacity by 1
- Waitlist mechanism for future openings

### 2. Cancellations

- Free up slot capacity
- Reorder remaining tokens
- Promote from waitlist if available

### 3. No-Shows

- Automatically mark after timeout
- Free up capacity
- Move queue forward

### 4. Doctor Delays

- Mark slot as delayed
- Recalculate all ETAs
- Can trigger reallocation to next slot

### 5. Emergency Insertions

- Highest priority (score: 1000)
- Can temporarily extend slot capacity
- Automatically placed at front of queue

### 6. Concurrent Bookings

- Thread-safe token allocation
- Prevents double-booking
- Atomic slot capacity updates

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Token booked successfully",
  "data": {
    "id": "token-uuid",
    "slotId": "slot-uuid",
    "patientName": "John Doe",
    "tokenNumber": "T001",
    "type": "ONLINE",
    "status": "SCHEDULED",
    "position": 1,
    "estimatedTime": "2026-01-31T09:00:00.000Z",
    "priorityScore": 200.123456
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Slot is full. Token cannot be allocated."
}
```

## 🧪 Testing

Run the simulation to test all scenarios:

```bash
npm run simulate
```

This demonstrates:

- 3 doctors with different specializations
- 7 time slots per doctor (9 AM - 5 PM)
- 10+ online bookings
- 5+ walk-ins
- 3 priority patients
- 2 follow-ups
- 2 emergency cases
- 2 cancellations
- 1 no-show
- 1 doctor delay scenario

## 📁 Project Structure

```
opd-token-system/
├── src/
│   ├── config/
│   │   └── config.js          # Configuration settings
│   ├── models/
│   │   ├── Doctor.js          # Doctor model
│   │   ├── Slot.js            # Slot model
│   │   └── Token.js           # Token model
│   ├── services/
│   │   ├── doctorService.js   # Doctor business logic
│   │   ├── slotService.js     # Slot management
│   │   └── tokenService.js    # Token allocation algorithm
│   ├── routes/
│   │   ├── doctorRoutes.js    # Doctor endpoints
│   │   ├── slotRoutes.js      # Slot endpoints
│   │   └── tokenRoutes.js     # Token endpoints
│   ├── middleware/
│   │   ├── validators.js      # Input validation
│   │   └── errorHandler.js    # Error handling
│   ├── database/
│   │   └── db.js              # In-memory database
│   ├── simulation/
│   │   └── opdSimulation.js   # OPD day simulation
│   └── server.js              # Express server
├── .env.example               # Environment template
├── package.json
└── README.md
```

## 🔐 Token Status Flow

```
SCHEDULED → WAITING → IN_PROGRESS → COMPLETED
    ↓           ↓           ↓
CANCELLED   NO_SHOW    CANCELLED
```

## 🌟 Key Features Explained

### 1. Elastic Capacity

- Slots can handle varying patient loads
- Emergency cases can temporarily extend capacity
- Automatic reallocation when needed

### 2. Priority Management

- 5 token types with different priorities
- Dynamic queue sorting
- Fair distribution within priority levels

### 3. Real-time Updates

- Live queue positions
- Updated ETAs on changes
- Instant reordering on cancellations

### 4. Failure Handling

- Graceful error messages
- Transaction-like operations
- Automatic cleanup on failures

## 📈 Performance Considerations

- In-memory storage for fast access (can be replaced with PostgreSQL/MongoDB)
- O(n log n) complexity for queue sorting
- Efficient token number reassignment
- Minimal database calls

## 🚀 Future Enhancements

- WebSocket support for real-time notifications
- SMS/Email notifications
- Patient mobile app integration
- Analytics dashboard
- Multi-hospital support
- Appointment reminders

## 📄 License

MIT

## 👨‍💻 Author

Backend Intern Assignment - OPD Token Allocation Engine

---

**Note**: This is a demonstration project using in-memory storage. For production use, integrate with a persistent database (PostgreSQL, MongoDB, etc.) and add authentication/authorization.
