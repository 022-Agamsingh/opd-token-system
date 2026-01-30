# API Documentation

## Base URL

```
http://localhost:3000
```

## Response Format

All API responses follow this structure:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For list endpoints
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Doctor Endpoints

### Create Doctor

**POST** `/api/doctors`

Create a new doctor in the system.

**Request Body:**

```json
{
  "name": "Dr. Rajesh Kumar",
  "specialization": "Cardiology",
  "opdDays": ["Monday", "Wednesday", "Friday"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. Rajesh Kumar",
    "specialization": "Cardiology",
    "opdDays": ["Monday", "Wednesday", "Friday"],
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

### Get All Doctors

**GET** `/api/doctors`

Retrieve all doctors. Optionally filter by specialization.

**Query Parameters:**

- `specialization` (optional): Filter by specialization

**Example:**

```
GET /api/doctors?specialization=Cardiology
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology",
      "opdDays": ["Monday", "Wednesday", "Friday"],
      "createdAt": "2026-01-30T10:00:00.000Z"
    }
  ]
}
```

---

### Get Doctor by ID

**GET** `/api/doctors/:id`

Retrieve a specific doctor by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. Rajesh Kumar",
    "specialization": "Cardiology",
    "opdDays": ["Monday", "Wednesday", "Friday"],
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

## Slot Endpoints

### Create Slot

**POST** `/api/slots`

Create a time slot for a doctor.

**Request Body:**

```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-01-31",
  "startTime": "09:00",
  "endTime": "10:00",
  "maxCapacity": 20
}
```

**Validation:**

- `date`: Must be in YYYY-MM-DD format
- `startTime`, `endTime`: Must be in HH:MM format (24-hour)
- `maxCapacity`: Must be at least 1

**Response:**

```json
{
  "success": true,
  "message": "Slot created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2026-01-31",
    "startTime": "09:00",
    "endTime": "10:00",
    "maxCapacity": 20,
    "currentCount": 0,
    "availableCapacity": 20,
    "isFull": false,
    "isDelayed": false,
    "delayMinutes": 0,
    "status": "ACTIVE"
  }
}
```

---

### Get Slot by ID

**GET** `/api/slots/:id`

Retrieve a specific slot.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2026-01-31",
    "startTime": "09:00",
    "endTime": "10:00",
    "maxCapacity": 20,
    "currentCount": 5,
    "availableCapacity": 15,
    "isFull": false,
    "status": "ACTIVE"
  }
}
```

---

### Get Doctor's Slots

**GET** `/api/slots/doctor/:doctorId`

Get all slots for a specific doctor.

**Query Parameters:**

- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Example:**

```
GET /api/slots/doctor/550e8400-e29b-41d4-a716-446655440000?date=2026-01-31
```

**Response:**

```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2026-01-31",
      "startTime": "09:00",
      "endTime": "10:00",
      "maxCapacity": 20,
      "currentCount": 5,
      "availableCapacity": 15,
      "isFull": false
    }
  ]
}
```

---

### Get Available Slots

**GET** `/api/slots/doctor/:doctorId/available`

Get only available (not full) slots for a doctor.

**Query Parameters:**

- `date` (required): Date in YYYY-MM-DD format

**Example:**

```
GET /api/slots/doctor/550e8400-e29b-41d4-a716-446655440000/available?date=2026-01-31
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "startTime": "09:00",
      "endTime": "10:00",
      "availableCapacity": 15,
      "isFull": false
    }
  ]
}
```

---

### Mark Slot as Delayed

**PATCH** `/api/slots/:id/delay`

Mark a slot as delayed by specified minutes.

**Request Body:**

```json
{
  "delayMinutes": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "Slot marked as delayed by 30 minutes",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "isDelayed": true,
    "delayMinutes": 30,
    "status": "DELAYED"
  }
}
```

---

### Get Slot Statistics

**GET** `/api/slots/:id/stats`

Get detailed statistics for a slot.

**Response:**

```json
{
  "success": true,
  "data": {
    "slotId": "660e8400-e29b-41d4-a716-446655440001",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2026-01-31",
    "time": "09:00-10:00",
    "maxCapacity": 20,
    "currentCount": 12,
    "availableCapacity": 8,
    "utilizationRate": "60.00%",
    "tokensByType": {
      "EMERGENCY": 1,
      "PRIORITY": 2,
      "FOLLOWUP": 2,
      "ONLINE": 5,
      "WALKIN": 2
    },
    "tokensByStatus": {
      "SCHEDULED": 10,
      "WAITING": 0,
      "IN_PROGRESS": 1,
      "COMPLETED": 0,
      "CANCELLED": 1,
      "NO_SHOW": 0
    }
  }
}
```

---

## Token Endpoints

### Book Online Token

**POST** `/api/tokens/book`

Book an online appointment token.

**Request Body:**

```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440001",
  "patientId": "PAT001",
  "patientName": "John Doe",
  "phoneNumber": "+919876543210"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token booked successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "slotId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "PAT001",
    "patientName": "John Doe",
    "phoneNumber": "+919876543210",
    "type": "ONLINE",
    "tokenNumber": "T006",
    "priorityScore": 200.123456,
    "status": "SCHEDULED",
    "position": 6,
    "estimatedTime": "2026-01-31T09:50:00.000Z",
    "bookedAt": "2026-01-30T14:30:00.000Z",
    "isRelocated": false
  }
}
```

---

### Generate Walk-in Token

**POST** `/api/tokens/walkin`

Generate a token for walk-in patient.

**Request Body:**

```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440001",
  "patientName": "Jane Smith",
  "phoneNumber": "+919876543211"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Walk-in token generated successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "patientId": "WALKIN-1738249800000",
    "patientName": "Jane Smith",
    "type": "WALKIN",
    "tokenNumber": "T007",
    "priorityScore": 100.123456,
    "status": "SCHEDULED",
    "position": 7
  }
}
```

---

### Generate Priority Token

**POST** `/api/tokens/priority`

Generate a priority (paid) token.

**Request Body:**

```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440001",
  "patientId": "VIP001",
  "patientName": "VIP Patient",
  "phoneNumber": "+919876543212"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Priority token generated successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "type": "PRIORITY",
    "tokenNumber": "T002",
    "priorityScore": 500.123456,
    "position": 2,
    "estimatedTime": "2026-01-31T09:10:00.000Z"
  }
}
```

---

### Generate Follow-up Token

**POST** `/api/tokens/followup`

Generate a follow-up appointment token.

**Request Body:**

```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440001",
  "patientId": "PAT001",
  "patientName": "John Doe",
  "phoneNumber": "+919876543210"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Follow-up token generated successfully",
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "type": "FOLLOWUP",
    "tokenNumber": "T004",
    "priorityScore": 300.123456,
    "position": 4
  }
}
```

---

### Insert Emergency Token

**POST** `/api/tokens/emergency`

Insert an emergency token (highest priority).

**Request Body:**

```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440001",
  "patientName": "Emergency Patient",
  "phoneNumber": "+919876543213"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Emergency token inserted successfully",
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "patientId": "EMERGENCY-1738249800000",
    "type": "EMERGENCY",
    "tokenNumber": "T001",
    "priorityScore": 1000.123456,
    "position": 1,
    "estimatedTime": "2026-01-31T09:00:00.000Z"
  }
}
```

---

### Get Token by ID

**GET** `/api/tokens/:id`

Retrieve a specific token.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "slotId": "660e8400-e29b-41d4-a716-446655440001",
    "patientName": "John Doe",
    "tokenNumber": "T006",
    "type": "ONLINE",
    "status": "SCHEDULED",
    "position": 6,
    "estimatedTime": "2026-01-31T09:50:00.000Z"
  }
}
```

---

### Get Patient's Tokens

**GET** `/api/tokens/patient/:patientId`

Get all tokens for a specific patient.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "tokenNumber": "T006",
      "status": "SCHEDULED",
      "bookedAt": "2026-01-30T14:30:00.000Z"
    }
  ]
}
```

---

### Get Token Queue

**GET** `/api/tokens/queue/:slotId`

Get the current token queue for a slot.

**Response:**

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "tokenNumber": "T001",
      "position": 1,
      "patientName": "Emergency Patient",
      "type": "EMERGENCY",
      "status": "SCHEDULED",
      "estimatedTime": "2026-01-31T09:00:00.000Z"
    },
    {
      "tokenNumber": "T002",
      "position": 2,
      "patientName": "VIP Patient",
      "type": "PRIORITY",
      "status": "SCHEDULED",
      "estimatedTime": "2026-01-31T09:10:00.000Z"
    }
  ]
}
```

---

### Update Token Status

**PATCH** `/api/tokens/:id/status`

Update the status of a token.

**Request Body:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Statuses:**

- `SCHEDULED`
- `WAITING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

**Response:**

```json
{
  "success": true,
  "message": "Token status updated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "IN_PROGRESS",
    "actualStartTime": "2026-01-31T09:45:00.000Z"
  }
}
```

---

### Cancel Token

**DELETE** `/api/tokens/:id/cancel`

Cancel a token and free up slot capacity.

**Request Body:**

```json
{
  "reason": "Patient cancelled"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token cancelled successfully",
  "data": {
    "token": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "status": "CANCELLED"
    },
    "reason": "Patient cancelled"
  }
}
```

**Side Effects:**

- Slot capacity is freed
- Remaining tokens are reordered
- Waitlisted patients may be promoted

---

### Reallocate Tokens

**POST** `/api/tokens/reallocate/:slotId`

Reallocate tokens from a slot to the next available slot.

**Request Body:**

```json
{
  "reason": "doctor_delay"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tokens reallocated successfully",
  "data": {
    "reallocated": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "tokenNumber": "T006",
        "isRelocated": true,
        "originalSlotId": "660e8400-e29b-41d4-a716-446655440001"
      }
    ],
    "fromSlot": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "startTime": "10:00",
      "endTime": "11:00"
    },
    "toSlot": {
      "id": "660e8400-e29b-41d4-a716-446655440007",
      "startTime": "11:00",
      "endTime": "12:00"
    },
    "reason": "doctor_delay"
  }
}
```

---

## Error Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | Success                                         |
| 201         | Created                                         |
| 400         | Bad Request (validation error, slot full, etc.) |
| 404         | Not Found (doctor, slot, or token not found)    |
| 500         | Internal Server Error                           |

## Common Error Examples

### Slot Full

```json
{
  "success": false,
  "error": "Slot is full. Token cannot be allocated."
}
```

### Doctor Not Found

```json
{
  "success": false,
  "error": "Doctor not found"
}
```

### Validation Error

```json
{
  "success": false,
  "errors": [
    {
      "msg": "Patient name is required",
      "param": "patientName",
      "location": "body"
    }
  ]
}
```

### Cannot Cancel Completed Token

```json
{
  "success": false,
  "error": "Cannot cancel completed token"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, implement rate limiting middleware.

## Authentication

Currently no authentication is required. For production use, implement JWT-based authentication.

---

## Postman Collection

A Postman collection with all endpoints is available for testing. Import the following:

```json
{
  "info": {
    "name": "OPD Token Allocation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [...]
}
```

---

For implementation details, see [ALGORITHM_DESIGN.md](ALGORITHM_DESIGN.md).
