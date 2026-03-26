# API Documentation

> **Project**: SDFitness Gym Management System  
> **API Version**: v1  
> **Base URL**: `https://api.sdfitness.com/api/v1`  
> **Last Updated**: 2026-01-29

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Versioning](#versioning)

---

## Overview

The SDFitness API is a RESTful API that provides access to all gym management features including member management, class booking, AI diet plan generation, payments, and analytics.

### Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://api.sdfitness.com/api/v1
```

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

### API Versioning

The API uses URL-based versioning:

```
/api/v1/members
/api/v2/members  (future)
```

---

## Authentication

### Authentication Methods

1. **JWT Bearer Token** (Primary)
2. **Refresh Token** (Cookie-based)
3. **API Key** (For integrations)

### JWT Token Flow

```javascript
// 1. Login to get tokens
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
// Refresh token set in httpOnly cookie

// 2. Use access token in requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// 3. Refresh when expired
POST /api/v1/auth/refresh
// Uses refresh token from cookie
```

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## API Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "member"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "isEmailVerified": false
  }
}
```

**Errors:**
- `400` - Validation error (weak password, invalid email)
- `409` - Email already exists

---

#### POST /auth/login

Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "totpToken": "123456"  // Optional, required if 2FA enabled
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "profilePhoto": "https://cdn.example.com/photos/user.jpg"
  },
  "requires2FA": false
}
```

**Errors:**
- `401` - Invalid credentials
- `401` - Invalid 2FA token
- `429` - Too many login attempts

---

#### POST /auth/logout

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /auth/refresh

Refresh access token using refresh token.

**Request:** (Refresh token from httpOnly cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid or expired refresh token

---

#### POST /auth/forgot-password

Request password reset email.

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limit:** 3 requests per hour per email

---

#### POST /auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid or expired token
- `400` - Password does not meet requirements

---

### Member Endpoints

#### GET /members

Get all members (Admin/Manager only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?page=1
&limit=20
&sort=-createdAt
&status=active
&search=john
&membershipId=507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "memberId": "507f1f77bcf86cd799439011",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "profilePhoto": "https://cdn.example.com/photos/user.jpg"
      },
      "memberNumber": "GYM-2026-0001",
      "status": "active",
      "membershipId": {
        "planId": {
          "name": "Premium Monthly"
        },
        "endDate": "2026-02-28T00:00:00.000Z"
      },
      "joinDate": "2026-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### GET /members/:id

Get member details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "memberId": "507f1f77bcf86cd799439011",
    "userId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890"
    },
    "memberNumber": "GYM-2026-0001",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "gender": "male",
    "height": {
      "value": 180,
      "unit": "cm"
    },
    "currentWeight": {
      "value": 75,
      "unit": "kg"
    },
    "targetWeight": {
      "value": 70,
      "unit": "kg"
    },
    "bmi": 23.15,
    "tdee": 2400,
    "fitnessGoals": ["weight_loss", "muscle_gain"],
    "dietaryPreferences": ["vegetarian"],
    "allergies": ["peanuts"],
    "activityLevel": "moderately_active",
    "status": "active",
    "joinDate": "2026-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Member not found
- `403` - Forbidden (cannot access other members)

---

#### POST /members

Create new member.

**Request:**
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1995-08-20",
  "gender": "female",
  "height": {
    "value": 165,
    "unit": "cm"
  },
  "currentWeight": {
    "value": 60,
    "unit": "kg"
  },
  "fitnessGoals": ["endurance", "flexibility"],
  "dietaryPreferences": ["vegan"],
  "activityLevel": "lightly_active"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "memberId": "507f1f77bcf86cd799439012",
    "memberNumber": "GYM-2026-0002",
    "qrCode": "https://api.sdfitness.com/qr/507f1f77bcf86cd799439012"
  }
}
```

---

#### PUT /members/:id

Update member profile.

**Request:**
```json
{
  "currentWeight": {
    "value": 73,
    "unit": "kg"
  },
  "fitnessGoals": ["weight_loss", "strength"],
  "activityLevel": "very_active"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "memberId": "507f1f77bcf86cd799439011",
    "bmi": 22.53,
    "tdee": 2600
  }
}
```

---

#### DELETE /members/:id

Delete member (Admin only).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

---

### Diet Plan Endpoints

#### POST /diet-plans/generate

Generate AI-powered diet plan.

**Request:**
```json
{
  "memberId": "507f1f77bcf86cd799439011",
  "targetCalories": 2000,
  "macroSplit": {
    "protein": 30,
    "carbs": 40,
    "fats": 30
  },
  "budget": {
    "amount": 100,
    "currency": "USD",
    "period": "weekly"
  },
  "preferences": {
    "mealsPerDay": 5,
    "dietaryRestrictions": ["vegetarian"],
    "allergies": ["peanuts"],
    "cuisinePreferences": ["mediterranean", "asian"]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Diet plan generated successfully",
  "data": {
    "dietPlanId": "507f1f77bcf86cd799439013",
    "targetCalories": 2000,
    "macroSplit": {
      "protein": { "grams": 150, "percentage": 30 },
      "carbs": { "grams": 200, "percentage": 40 },
      "fats": { "grams": 67, "percentage": 30 }
    },
    "meals": [
      {
        "mealType": "breakfast",
        "name": "Mediterranean Veggie Scramble",
        "items": [
          { "food": "Eggs", "quantity": "3", "unit": "whole" },
          { "food": "Spinach", "quantity": "1", "unit": "cup" },
          { "food": "Feta cheese", "quantity": "30", "unit": "g" }
        ],
        "calories": 380,
        "macros": {
          "protein": 28,
          "carbs": 12,
          "fats": 24
        },
        "estimatedCost": { "amount": 3.50, "currency": "USD" },
        "instructions": [
          "Heat pan with olive oil",
          "Sauté spinach until wilted",
          "Add beaten eggs and scramble",
          "Top with crumbled feta"
        ],
        "prepTime": 5,
        "cookTime": 10
      }
    ],
    "shoppingList": [
      {
        "item": "Eggs",
        "quantity": "2",
        "unit": "dozen",
        "category": "protein",
        "estimatedCost": 6.00
      }
    ],
    "totalEstimatedCost": 95.50,
    "generatedAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Rate Limit:** 10 requests per hour

**Errors:**
- `400` - Invalid parameters
- `429` - AI generation limit exceeded
- `503` - AI service unavailable

---

#### GET /diet-plans/member/:memberId

Get all diet plans for a member.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "dietPlanId": "507f1f77bcf86cd799439013",
      "planName": "Custom Diet Plan",
      "targetCalories": 2000,
      "generatedAt": "2026-01-29T10:00:00.000Z",
      "isActive": true,
      "isFavorite": false
    }
  ]
}
```

---

#### GET /diet-plans/:id

Get specific diet plan details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    // Full diet plan object (same as generate response)
  }
}
```

---

#### DELETE /diet-plans/:id

Delete diet plan.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Diet plan deleted successfully"
}
```

---

### Workout Endpoints

#### GET /workouts/templates

Get workout templates.

**Query Parameters:**
```
?difficulty=beginner
&category=strength
&muscleGroup=chest
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "templateId": "507f1f77bcf86cd799439014",
      "name": "Beginner Full Body",
      "difficulty": "beginner",
      "category": "strength",
      "duration": 45,
      "exercises": [
        {
          "exerciseId": "507f1f77bcf86cd799439015",
          "name": "Squats",
          "sets": 3,
          "reps": 12,
          "restPeriod": 60
        }
      ],
      "estimatedCaloriesBurned": 250,
      "rating": { "average": 4.5, "count": 120 }
    }
  ]
}
```

---

#### POST /workouts

Log a workout.

**Request:**
```json
{
  "memberId": "507f1f77bcf86cd799439011",
  "templateId": "507f1f77bcf86cd799439014",
  "workoutDate": "2026-01-29T08:00:00.000Z",
  "exercises": [
    {
      "exerciseId": "507f1f77bcf86cd799439015",
      "sets": [
        { "setNumber": 1, "reps": 12, "weight": 60, "completed": true },
        { "setNumber": 2, "reps": 10, "weight": 60, "completed": true },
        { "setNumber": 3, "reps": 8, "weight": 60, "completed": true }
      ]
    }
  ],
  "notes": "Felt strong today!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Workout logged successfully",
  "data": {
    "workoutId": "507f1f77bcf86cd799439016",
    "duration": 45,
    "totalCaloriesBurned": 280,
    "personalRecords": [
      {
        "exerciseId": "507f1f77bcf86cd799439015",
        "recordType": "max_weight",
        "value": 60
      }
    ]
  }
}
```

---

#### GET /workouts/member/:memberId

Get workout history.

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&page=1
&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "workoutId": "507f1f77bcf86cd799439016",
      "workoutDate": "2026-01-29T08:00:00.000Z",
      "duration": 45,
      "totalCaloriesBurned": 280,
      "exercises": [...]
    }
  ],
  "stats": {
    "totalWorkouts": 15,
    "totalCaloriesBurned": 4200,
    "averageDuration": 42
  }
}
```

---

### Class Endpoints

#### GET /classes

Get class schedule.

**Query Parameters:**
```
?date=2026-01-29
&type=yoga
&trainerId=507f1f77bcf86cd799439017
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "classId": "507f1f77bcf86cd799439018",
      "name": "Morning Yoga",
      "type": "yoga",
      "trainerId": {
        "firstName": "Sarah",
        "lastName": "Johnson",
        "profilePhoto": "https://cdn.example.com/trainers/sarah.jpg"
      },
      "schedule": {
        "dayOfWeek": 1,
        "startTime": "07:00",
        "endTime": "08:00"
      },
      "duration": 60,
      "capacity": 20,
      "currentBookings": 15,
      "difficulty": "all_levels",
      "isActive": true
    }
  ]
}
```

---

#### POST /classes/:classId/book

Book a class.

**Request:**
```json
{
  "memberId": "507f1f77bcf86cd799439011",
  "classDate": "2026-01-30T07:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Class booked successfully",
  "data": {
    "bookingId": "507f1f77bcf86cd799439019",
    "status": "confirmed",
    "classDate": "2026-01-30T07:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Class is full
- `409` - Already booked

---

#### POST /classes/:classId/waitlist

Join waitlist.

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Added to waitlist",
  "data": {
    "bookingId": "507f1f77bcf86cd799439020",
    "status": "waitlisted",
    "waitlistPosition": 3
  }
}
```

---

#### DELETE /class-bookings/:bookingId

Cancel booking.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### Payment Endpoints

#### POST /payments

Process payment.

**Request:**
```json
{
  "memberId": "507f1f77bcf86cd799439011",
  "membershipId": "507f1f77bcf86cd799439021",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "paymentGateway": "stripe",
  "paymentDetails": {
    "stripePaymentMethodId": "pm_1234567890"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "507f1f77bcf86cd799439022",
    "transactionId": "txn_1234567890",
    "invoiceNumber": "INV-2026-0001",
    "invoiceUrl": "https://cdn.example.com/invoices/INV-2026-0001.pdf",
    "status": "completed",
    "paymentDate": "2026-01-29T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Payment failed
- `402` - Insufficient funds

---

#### GET /payments/member/:memberId

Get payment history.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "paymentId": "507f1f77bcf86cd799439022",
      "amount": 99.99,
      "currency": "USD",
      "paymentMethod": "credit_card",
      "status": "completed",
      "invoiceNumber": "INV-2026-0001",
      "invoiceUrl": "https://cdn.example.com/invoices/INV-2026-0001.pdf",
      "paymentDate": "2026-01-29T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /payments/:paymentId/refund

Process refund (Admin only).

**Request:**
```json
{
  "amount": 99.99,
  "reason": "Membership cancelled"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundAmount": 99.99,
    "refundTransactionId": "rfnd_1234567890",
    "refundDate": "2026-01-29T11:00:00.000Z"
  }
}
```

---

### Attendance Endpoints

#### POST /attendance/check-in

Check in to gym.

**Request:**
```json
{
  "memberId": "507f1f77bcf86cd799439011",
  "qrCode": "GYM-2026-0001-QR123",
  "checkInMethod": "qr_code"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "attendanceId": "507f1f77bcf86cd799439023",
    "checkInTime": "2026-01-29T08:00:00.000Z",
    "membershipValid": true
  }
}
```

**Errors:**
- `403` - Membership expired
- `409` - Already checked in

---

#### POST /attendance/check-out

Check out from gym.

**Request:**
```json
{
  "attendanceId": "507f1f77bcf86cd799439023"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "checkOutTime": "2026-01-29T10:00:00.000Z",
    "duration": 120
  }
}
```

---

#### GET /attendance/member/:memberId

Get attendance history.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "attendanceId": "507f1f77bcf86cd799439023",
      "checkInTime": "2026-01-29T08:00:00.000Z",
      "checkOutTime": "2026-01-29T10:00:00.000Z",
      "duration": 120
    }
  ],
  "stats": {
    "totalVisits": 45,
    "averageDuration": 95,
    "thisMonth": 12
  }
}
```

---

### Analytics Endpoints

#### GET /analytics/dashboard

Get dashboard statistics (Admin/Manager).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 250,
      "active": 230,
      "newThisMonth": 15,
      "growth": 6.4
    },
    "revenue": {
      "thisMonth": 24750.00,
      "lastMonth": 23200.00,
      "growth": 6.7,
      "yearToDate": 24750.00
    },
    "attendance": {
      "today": 45,
      "thisWeek": 312,
      "averageDaily": 52
    },
    "classes": {
      "totalScheduled": 120,
      "averageAttendance": 15.5,
      "mostPopular": "Morning Yoga"
    }
  }
}
```

---

#### GET /analytics/reports/revenue

Get revenue report.

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&groupBy=day
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 24750.00,
    "breakdown": [
      { "date": "2026-01-01", "amount": 850.00 },
      { "date": "2026-01-02", "amount": 920.00 }
    ],
    "byPaymentMethod": {
      "credit_card": 18500.00,
      "cash": 4250.00,
      "bank_transfer": 2000.00
    }
  }
}
```

---

### Notification Endpoints

#### GET /notifications

Get user notifications.

**Query Parameters:**
```
?isRead=false
&type=payment
&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "notificationId": "507f1f77bcf86cd799439024",
      "type": "payment",
      "title": "Payment Successful",
      "message": "Your payment of $99.99 has been processed",
      "isRead": false,
      "priority": "medium",
      "createdAt": "2026-01-29T10:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

---

#### PATCH /notifications/:id/read

Mark notification as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Messaging Endpoints

#### POST /messages

Send message.

**Request:**
```json
{
  "receiverId": "507f1f77bcf86cd799439025",
  "content": "Hi, I have a question about my diet plan."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "507f1f77bcf86cd799439026",
    "conversationId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439025",
    "createdAt": "2026-01-29T10:00:00.000Z"
  }
}
```

---

#### GET /messages/conversations

Get user conversations.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439025",
      "otherUser": {
        "userId": "507f1f77bcf86cd799439025",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "profilePhoto": "https://cdn.example.com/trainers/sarah.jpg"
      },
      "lastMessage": {
        "content": "Sure, I can help with that!",
        "createdAt": "2026-01-29T10:05:00.000Z",
        "isRead": false
      },
      "unreadCount": 1
    }
  ]
}
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Validation error, invalid input |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate resource, business logic conflict |
| `422` | Unprocessable Entity | Valid syntax but semantic errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | External service down (AI, payment gateway) |

### Error Codes

```javascript
// Authentication Errors
INVALID_CREDENTIALS
TOKEN_EXPIRED
TOKEN_INVALID
2FA_REQUIRED
2FA_INVALID

// Validation Errors
VALIDATION_ERROR
MISSING_REQUIRED_FIELD
INVALID_FORMAT
OUT_OF_RANGE

// Resource Errors
NOT_FOUND
ALREADY_EXISTS
CONFLICT

// Permission Errors
FORBIDDEN
INSUFFICIENT_PERMISSIONS

// Rate Limiting
RATE_LIMIT_EXCEEDED
AI_QUOTA_EXCEEDED

// External Services
PAYMENT_FAILED
AI_SERVICE_UNAVAILABLE
EMAIL_SERVICE_ERROR
```

---

## Rate Limiting

### Rate Limit Headers

Every response includes rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643472000
```

### Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Password Reset | 3 requests | 1 hour |
| AI Generation | 10 requests | 1 hour |
| File Upload | 20 requests | 1 hour |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 900
  }
}
```

---

## Pagination

### Query Parameters

```
?page=1          // Page number (1-indexed)
&limit=20        // Items per page (max: 100)
&sort=-createdAt // Sort field (- for descending)
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 195,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Sorting

Use `-` prefix for descending order:

```
?sort=-createdAt     // Newest first
?sort=firstName      // A-Z
?sort=-price         // Highest first
```

Multiple sort fields:

```
?sort=-status,createdAt  // Active first, then by date
```

---

## Versioning

### URL Versioning

```
/api/v1/members  // Current version
/api/v2/members  // Future version
```

### Version Header (Alternative)

```
Accept: application/vnd.sdfitness.v1+json
```

### Deprecation Notice

Deprecated endpoints include a header:

```
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: <https://api.sdfitness.com/api/v2/members>; rel="successor-version"
```

---

## Webhook Events

### Supported Events

```javascript
// Member Events
member.created
member.updated
member.deleted

// Payment Events
payment.succeeded
payment.failed
payment.refunded

// Membership Events
membership.created
membership.expired
membership.renewed

// Class Events
class.booked
class.cancelled
class.waitlist_promoted
```

### Webhook Payload

```json
{
  "event": "payment.succeeded",
  "timestamp": "2026-01-29T10:00:00.000Z",
  "data": {
    "paymentId": "507f1f77bcf86cd799439022",
    "amount": 99.99,
    "memberId": "507f1f77bcf86cd799439011"
  }
}
```

---

## OpenAPI/Swagger Specification

Full OpenAPI 3.0 specification available at:

```
https://api.sdfitness.com/api-docs
https://api.sdfitness.com/swagger.json
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026-01-29  
**Support**: api-support@sdfitness.com
