# Database Schema Documentation

> **Database**: MongoDB  
> **ODM**: Mongoose  
> **Last Updated**: 2026-01-29

---

## Table of Contents

- [Schema Overview](#schema-overview)
- [Collections](#collections)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Validation Rules](#validation-rules)

---

## Schema Overview

The SDFitness gym management system uses MongoDB with the following collections:

| Collection | Purpose | Key Relationships |
|------------|---------|-------------------|
| `users` | Authentication and base user data | Referenced by members, trainers |
| `members` | Member-specific data and health metrics | References users, memberships, trainers |
| `trainers` | Trainer profiles and certifications | References users |
| `memberships` | Active membership records | References members, membershipPlans |
| `membershipPlans` | Available membership tiers | Referenced by memberships |
| `dietPlans` | AI-generated diet plans | References members |
| `workouts` | Workout logs | References members, trainers, workoutTemplates |
| `workoutTemplates` | Predefined workout plans | Referenced by workouts |
| `exercises` | Exercise library | Referenced by workoutTemplates |
| `classes` | Scheduled fitness classes | References trainers |
| `classBookings` | Class reservations | References classes, members |
| `payments` | Payment transactions | References members, memberships |
| `attendance` | Check-in/check-out records | References members |
| `equipment` | Gym equipment inventory | - |
| `notifications` | User notifications | References users |
| `messages` | Direct messaging | References users (sender/receiver) |
| `announcements` | Gym-wide announcements | References users (creator) |
| `reviews` | Ratings and feedback | References members, trainers, classes |
| `supportTickets` | Customer support | References users |
| `auditLogs` | Admin action tracking | References users |
| `foodPrices` | Real-time food price tracking | - |

---

## Collections

### 1. Users Collection

**Purpose**: Core authentication and user management

```javascript
{
  _id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    // Hashed with bcrypt (10 rounds)
  },
  role: {
    type: String,
    enum: ['member', 'trainer', 'admin', 'manager', 'receptionist'],
    default: 'member',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
  },
  profilePhoto: {
    type: String, // URL to S3/Cloudinary
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `email` (unique)
- `role`
- `isActive`
- `createdAt` (descending)

---

### 2. Members Collection

**Purpose**: Member-specific health data and preferences

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  membershipId: {
    type: ObjectId,
    ref: 'Membership',
    default: null
  },
  assignedTrainerId: {
    type: ObjectId,
    ref: 'Trainer',
    default: null
  },
  memberNumber: {
    type: String,
    unique: true,
    // Auto-generated: GYM-YYYY-XXXX
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  
  // Health Metrics
  height: {
    value: {
      type: Number,
      required: true,
      min: 50,
      max: 300
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm'
    }
  },
  currentWeight: {
    value: {
      type: Number,
      required: true,
      min: 20,
      max: 500
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  targetWeight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  bodyFatPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Calculated Fields
  bmi: Number,
  bmr: Number, // Basal Metabolic Rate
  tdee: Number, // Total Daily Energy Expenditure
  
  // Fitness Goals
  fitnessGoals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', 'strength', 'athletic_performance']
  }],
  
  // Dietary Information
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'halal', 'kosher', 'gluten_free', 'dairy_free', 'none']
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  dietBudget: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  
  // Activity Level
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'moderately_active'
  },
  
  // Medical Information
  medicalConditions: [{
    type: String,
    trim: true
  }],
  medications: [{
    type: String,
    trim: true
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  
  // QR Code for Check-in
  qrCode: {
    type: String,
    unique: true
    // Generated on member creation
  },
  
  // Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'frozen'],
    default: 'active'
  },
  notes: String, // Admin notes
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `userId` (unique)
- `membershipId`
- `assignedTrainerId`
- `memberNumber` (unique)
- `qrCode` (unique)
- `status`
- `joinDate` (descending)

---

### 3. Trainers Collection

**Purpose**: Trainer profiles, certifications, and availability

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  trainerNumber: {
    type: String,
    unique: true
    // Auto-generated: TRN-YYYY-XXXX
  },
  
  // Professional Information
  specializations: [{
    type: String,
    enum: ['strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'martial_arts', 'dance', 'nutrition', 'rehabilitation', 'sports_specific']
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String // S3/Cloudinary URL
  }],
  experience: {
    years: {
      type: Number,
      min: 0
    },
    description: String
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Availability
  weeklySchedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    slots: [{
      startTime: String, // Format: "HH:MM"
      endTime: String,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  
  // Performance Metrics
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalClassesTaught: {
    type: Number,
    default: 0
  },
  totalMembersAssigned: {
    type: Number,
    default: 0
  },
  
  // Compensation
  commissionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0 // Percentage
  },
  hourlyRate: Number,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `userId` (unique)
- `trainerNumber` (unique)
- `specializations`
- `isActive`
- `rating.average` (descending)

---

### 4. Membership Plans Collection

**Purpose**: Available membership tiers and pricing

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  duration: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['days', 'months', 'years'],
      default: 'months'
    }
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Features
  features: [{
    name: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  
  // Limits
  classBookingLimit: {
    type: Number,
    default: null // null = unlimited
  },
  guestPassesPerMonth: {
    type: Number,
    default: 0
  },
  personalTrainingSessions: {
    type: Number,
    default: 0
  },
  
  // Trial
  hasTrial: {
    type: Boolean,
    default: false
  },
  trialDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks'],
      default: 'days'
    }
  },
  
  // Discount
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `isActive`
- `displayOrder`
- `price.amount`

---

### 5. Memberships Collection

**Purpose**: Active membership records for members

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  planId: {
    type: ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled', 'frozen'],
    default: 'active'
  },
  
  // Freeze Information
  freezeHistory: [{
    freezeStartDate: Date,
    freezeEndDate: Date,
    reason: String,
    requestedAt: Date
  }],
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: false
  },
  
  // Payment
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  
  // Usage Statistics
  classesAttended: {
    type: Number,
    default: 0
  },
  checkInsCount: {
    type: Number,
    default: 0
  },
  
  // Cancellation
  cancellationDate: Date,
  cancellationReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `planId`
- `status`
- `endDate` (ascending) // For expiry checks
- `startDate` (descending)

---

### 6. Diet Plans Collection

**Purpose**: AI-generated personalized diet plans

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  
  // Plan Details
  planName: {
    type: String,
    default: 'Custom Diet Plan'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  
  // Nutritional Targets
  targetCalories: {
    type: Number,
    required: true,
    min: 1000,
    max: 10000
  },
  macroSplit: {
    protein: {
      grams: Number,
      percentage: Number
    },
    carbs: {
      grams: Number,
      percentage: Number
    },
    fats: {
      grams: Number,
      percentage: Number
    }
  },
  
  // Budget
  budget: {
    amount: Number,
    currency: String,
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    }
  },
  
  // Meals
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'],
      required: true
    },
    name: String,
    items: [{
      food: String,
      quantity: String,
      unit: String
    }],
    calories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number,
      fiber: Number
    },
    estimatedCost: {
      amount: Number,
      currency: String
    },
    instructions: [String],
    prepTime: Number, // minutes
    cookTime: Number // minutes
  }],
  
  // Weekly Schedule
  weeklySchedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    meals: [{
      type: ObjectId,
      // Reference to meals array by index or embedded
    }]
  }],
  
  // Shopping List
  shoppingList: {
    items: [{
      foodId: {
        type: String, // Matches foodId in foodPrices collection
        required: true
      },
      name: String,
      quantity: Number,
      unit: String,
      category: {
        type: String,
        enum: ['produce', 'protein', 'dairy', 'grains', 'pantry', 'frozen', 'other']
      },
      priceAtGeneration: Number, // Cost when plan was created
      currentPrice: Number,      // Live cost updated by priceWatcher
      store: String              // Which store this price is from
    }],
    totalAtGeneration: Number,
    currentTotal: Number,
    lastPriceUpdate: Date,
    priceChanged: {
      type: Boolean,
      default: false
    }
  },
  
  // AI Metadata
  aiProvider: {
    type: String,
    enum: ['openai', 'anthropic', 'gemini', 'cohere']
  },
  promptVersion: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  // Member Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `isActive`
- `generatedAt` (descending)
- `isFavorite`

---

### 7. Exercises Collection

**Purpose**: Library of exercises with instructions

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'calves', 'glutes', 'full_body']
  }],
  equipmentNeeded: [{
    type: String,
    enum: ['barbell', 'dumbbell', 'kettlebell', 'resistance_band', 'cable_machine', 'bodyweight', 'bench', 'pull_up_bar', 'treadmill', 'bike', 'rowing_machine', 'other']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometric']
  },
  instructions: [{
    step: Number,
    description: String
  }],
  videoUrl: String,
  thumbnailUrl: String,
  caloriesBurnedPerMinute: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `name` (unique)
- `muscleGroups`
- `difficulty`
- `category`
- `isActive`

---

### 8. Workout Templates Collection

**Purpose**: Predefined workout plans

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  createdBy: {
    type: ObjectId,
    ref: 'Trainer'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'hiit', 'endurance', 'flexibility', 'full_body', 'upper_body', 'lower_body', 'core']
  },
  duration: Number, // minutes
  exercises: [{
    exerciseId: {
      type: ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: Number,
    reps: Number,
    duration: Number, // seconds (for timed exercises)
    restPeriod: Number, // seconds
    weight: Number, // optional suggested weight
    notes: String
  }],
  estimatedCaloriesBurned: Number,
  isPublic: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `difficulty`
- `category`
- `isPublic`
- `rating.average` (descending)
- `createdBy`

---

### 9. Workouts Collection

**Purpose**: Member workout logs and history

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  trainerId: {
    type: ObjectId,
    ref: 'Trainer'
  },
  templateId: {
    type: ObjectId,
    ref: 'WorkoutTemplate'
  },
  workoutDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // minutes (calculated)
  
  exercises: [{
    exerciseId: {
      type: ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: [{
      setNumber: Number,
      reps: Number,
      weight: Number,
      duration: Number, // seconds
      completed: {
        type: Boolean,
        default: false
      }
    }],
    notes: String
  }],
  
  totalCaloriesBurned: Number,
  
  // Performance
  personalRecords: [{
    exerciseId: ObjectId,
    recordType: {
      type: String,
      enum: ['max_weight', 'max_reps', 'longest_duration']
    },
    value: Number,
    achievedAt: Date
  }],
  
  // Feedback
  difficulty: {
    type: String,
    enum: ['too_easy', 'just_right', 'too_hard']
  },
  energyLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  notes: String,
  
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'skipped'],
    default: 'planned'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `trainerId`
- `workoutDate` (descending)
- `status`
- Compound: `memberId + workoutDate` (descending)

---

### 10. Classes Collection

**Purpose**: Scheduled fitness classes

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['yoga', 'pilates', 'spin', 'hiit', 'zumba', 'boxing', 'crossfit', 'dance', 'strength', 'cardio', 'other'],
    required: true
  },
  trainerId: {
    type: ObjectId,
    ref: 'Trainer',
    required: true
  },
  
  // Schedule
  schedule: {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    },
    startTime: {
      type: String,
      required: true // Format: "HH:MM"
    },
    endTime: {
      type: String,
      required: true
    }
  },
  
  // One-time class override
  specificDate: Date, // For special/one-time classes
  
  duration: {
    type: Number,
    required: true // minutes
  },
  
  // Capacity
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentBookings: {
    type: Number,
    default: 0
  },
  waitlistEnabled: {
    type: Boolean,
    default: true
  },
  
  // Difficulty
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'all_levels'
  },
  
  // Requirements
  requiresEquipment: [{
    type: String
  }],
  minimumMembershipLevel: {
    type: ObjectId,
    ref: 'MembershipPlan'
  },
  
  // Recurring
  isRecurring: {
    type: Boolean,
    default: true
  },
  recurringEndDate: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  
  // Metadata
  caloriesBurnedEstimate: Number,
  imageUrl: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `trainerId`
- `type`
- `schedule.dayOfWeek`
- `isActive`
- `specificDate`
- Compound: `schedule.dayOfWeek + schedule.startTime`

---

### 11. Class Bookings Collection

**Purpose**: Member class reservations

```javascript
{
  _id: ObjectId,
  classId: {
    type: ObjectId,
    ref: 'Class',
    required: true
  },
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  
  // Booking Details
  bookingDate: {
    type: Date,
    default: Date.now
  },
  classDate: {
    type: Date,
    required: true // Actual date of the class
  },
  
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled', 'attended', 'no_show'],
    default: 'confirmed'
  },
  
  // Waitlist
  waitlistPosition: Number,
  
  // Cancellation
  cancellationDate: Date,
  cancellationReason: String,
  
  // Attendance
  checkedInAt: Date,
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `classId`
- `memberId`
- `classDate` (descending)
- `status`
- Compound: `memberId + status`
- Compound: `classId + classDate + status`

---

### 12. Payments Collection

**Purpose**: Payment transactions and invoices

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  membershipId: {
    type: ObjectId,
    ref: 'Membership'
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'upi', 'wallet', 'other'],
    required: true
  },
  
  // Payment Gateway
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'manual']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  gatewayResponse: Object, // Store full gateway response
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Dates
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  
  // Invoice
  invoiceNumber: {
    type: String,
    unique: true
    // Auto-generated: INV-YYYY-XXXX
  },
  invoiceUrl: String, // S3/Cloudinary URL
  
  // Refund
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date,
  refundReason: String,
  refundTransactionId: String,
  
  // Metadata
  description: String,
  notes: String,
  processedBy: {
    type: ObjectId,
    ref: 'User' // Admin who processed
  },
  
  // Late Payment
  isLate: {
    type: Boolean,
    default: false
  },
  lateFee: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `membershipId`
- `status`
- `paymentDate` (descending)
- `invoiceNumber` (unique)
- `transactionId` (unique, sparse)
- Compound: `memberId + status`

---

### 13. Attendance Collection

**Purpose**: Member check-in/check-out tracking

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  
  // Check-in Details
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: Date,
  
  duration: Number, // minutes (calculated on checkout)
  
  // Method
  checkInMethod: {
    type: String,
    enum: ['qr_code', 'manual', 'rfid', 'biometric'],
    default: 'qr_code'
  },
  
  // Validation
  membershipValid: {
    type: Boolean,
    default: true
  },
  
  // Location (if multiple gym locations)
  location: {
    type: String,
    default: 'main'
  },
  
  // Metadata
  notes: String,
  processedBy: {
    type: ObjectId,
    ref: 'User' // Staff who processed manual check-in
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `checkInTime` (descending)
- Compound: `memberId + checkInTime` (descending)
- `membershipValid`

---

### 14. Equipment Collection

**Purpose**: Gym equipment inventory and maintenance

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'free_weights', 'machines', 'accessories', 'other'],
    required: true
  },
  brand: String,
  model: String,
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Inventory
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableQuantity: {
    type: Number,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['working', 'maintenance', 'broken', 'retired'],
    default: 'working'
  },
  
  // Purchase Information
  purchaseDate: Date,
  purchaseCost: Number,
  vendor: String,
  warrantyExpiry: Date,
  
  // Maintenance
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  maintenanceInterval: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'months'
    }
  },
  maintenanceHistory: [{
    date: Date,
    description: String,
    cost: Number,
    performedBy: String,
    notes: String
  }],
  
  // Reservation (for limited equipment)
  isReservable: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  location: String, // Area in gym
  imageUrl: String,
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `category`
- `status`
- `nextMaintenanceDate` (ascending)
- `serialNumber` (unique, sparse)

---

### 15. Notifications Collection

**Purpose**: User notifications

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['payment', 'class', 'membership', 'announcement', 'message', 'system', 'reminder'],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related Entity
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['payment', 'class', 'membership', 'message', 'announcement']
    },
    entityId: ObjectId
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Delivery
  channels: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Action
  actionUrl: String,
  actionText: String,
  
  expiresAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `userId`
- `isRead`
- `type`
- `createdAt` (descending)
- Compound: `userId + isRead + createdAt` (descending)

---

### 16. Messages Collection

**Purpose**: Direct messaging between users

```javascript
{
  _id: ObjectId,
  senderId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Attachments
  attachments: [{
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Conversation ID (for grouping)
  conversationId: {
    type: String,
    required: true,
    index: true
    // Generated from sorted user IDs: `${smallerId}_${largerId}`
  },
  
  // Deletion
  deletedBySender: {
    type: Boolean,
    default: false
  },
  deletedByReceiver: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `senderId`
- `receiverId`
- `conversationId`
- `createdAt` (descending)
- `isRead`
- Compound: `conversationId + createdAt` (descending)

---

### 17. Announcements Collection

**Purpose**: Gym-wide announcements

```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'members', 'trainers', 'staff'],
    default: 'all'
  },
  
  // Scheduling
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'expired'],
    default: 'draft'
  },
  
  // Notifications
  sendNotification: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  imageUrl: String,
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `status`
- `publishDate` (descending)
- `targetAudience`
- `createdBy`

---

### 18. Reviews Collection

**Purpose**: Member feedback and ratings

```javascript
{
  _id: ObjectId,
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  
  // Review Target
  reviewType: {
    type: String,
    enum: ['trainer', 'class', 'facility', 'equipment'],
    required: true
  },
  targetId: {
    type: ObjectId,
    required: true
    // Can reference Trainer, Class, or Equipment
  },
  
  // Rating
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Feedback
  title: {
    type: String,
    maxlength: 200
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  
  // Status
  isApproved: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Response
  response: {
    content: String,
    respondedBy: {
      type: ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `memberId`
- `reviewType`
- `targetId`
- `rating`
- `isApproved`
- `createdAt` (descending)
- Compound: `reviewType + targetId + isApproved`

---

### 19. Support Tickets Collection

**Purpose**: Customer support and issue tracking

```javascript
{
  _id: ObjectId,
  ticketNumber: {
    type: String,
    unique: true
    // Auto-generated: TKT-YYYY-XXXX
  },
  
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Classification
  category: {
    type: String,
    enum: ['billing', 'technical', 'membership', 'class', 'trainer', 'equipment', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Assignment
  assignedTo: {
    type: ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  
  // Conversation
  messages: [{
    senderId: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false // Internal notes not visible to customer
    },
    attachments: [{
      fileUrl: String,
      fileName: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution
  resolvedAt: Date,
  resolvedBy: {
    type: ObjectId,
    ref: 'User'
  },
  resolution: String,
  
  // Customer Satisfaction
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `ticketNumber` (unique)
- `userId`
- `status`
- `priority`
- `assignedTo`
- `createdAt` (descending)
- Compound: `status + priority`

---

### 20. Food Prices Collection

**Purpose**: Real-time store prices for ML budget scoring and shopping list updates

```javascript
{
  _id: ObjectId,
  foodId: {
    type: String,
    required: true,
    unique: true
    // Identifier used by the Python ML model (e.g., 'chicken_breast')
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['protein', 'carbs', 'fats', 'vegetable', 'fruit', 'dairy', 'other'],
    required: true
  },
  
  // Price history across different stores
  prices: [{
    store: {
      type: String,
      required: true
    },
    pricePerUnit: Number,
    unit: String,
    pricePerGram: {
      type: Number,
      required: true
      // Normalized for ML scoring
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      enum: ['scraper_catalog', 'api', 'manual'],
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Quick aggregates for the ML model
  averagePricePerGram: Number,
  lowestPricePerGram: Number,
  currency: {
    type: String,
    default: 'LKR'
  },
  
  isVerified: {
    type: Boolean,
    default: false // Set to true when admin confirms fuzzy match
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `foodId` (unique)
- `category`
- `prices.store`
- `isVerified`

---

### 21. Audit Logs Collection

**Purpose**: Track admin actions for security and compliance

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'read', 'update', 'delete',
      'login', 'logout', 'password_reset',
      'member_created', 'member_updated', 'member_deleted',
      'payment_processed', 'payment_refunded',
      'membership_created', 'membership_cancelled',
      'class_created', 'class_cancelled',
      'settings_updated', 'user_role_changed'
    ]
  },
  
  resource: {
    type: String,
    required: true
    // e.g., 'Member', 'Payment', 'Class', 'User'
  },
  resourceId: ObjectId,
  
  // Details
  changes: Object, // Store before/after values
  metadata: Object, // Additional context
  
  // Request Info
  ipAddress: String,
  userAgent: String,
  
  // Result
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}
```

**Indexes**:
- `userId`
- `action`
- `resource`
- `timestamp` (descending)
- Compound: `userId + timestamp` (descending)
- Compound: `resource + resourceId`

---

## Relationships

### Entity Relationship Diagram

```
User (1) ──── (1) Member
User (1) ──── (1) Trainer
Member (1) ──── (0..1) Membership
Membership (N) ──── (1) MembershipPlan
Member (1) ──── (N) DietPlan
Member (1) ──── (N) Workout
Member (N) ──── (1) Trainer [assigned]
Trainer (1) ──── (N) Workout
Trainer (1) ──── (N) Class
Class (1) ──── (N) ClassBooking
Member (1) ──── (N) ClassBooking
Member (1) ──── (N) Payment
Membership (1) ──── (N) Payment
Member (1) ──── (N) Attendance
Workout (N) ──── (1) WorkoutTemplate
WorkoutTemplate (N) ──── (N) Exercise
User (1) ──── (N) Notification
User (1) ──── (N) Message [sender]
User (1) ──── (N) Message [receiver]
User (1) ──── (N) Announcement [creator]
Member (1) ──── (N) Review
User (1) ──── (N) SupportTicket
User (1) ──── (N) AuditLog
DietPlan (N) ──── (M) FoodPrice [via shoppingList.foodId]
```

---

## Indexes

### Performance Optimization Indexes

All collections include basic indexes on:
- Primary keys (`_id`)
- Foreign keys (references to other collections)
- Frequently queried fields (status, dates)
- Unique constraints (email, memberNumber, etc.)

### Compound Indexes for Common Queries

```javascript
// Members - Find active members with valid memberships
db.members.createIndex({ status: 1, membershipId: 1 })

// Workouts - Member workout history
db.workouts.createIndex({ memberId: 1, workoutDate: -1 })

// Payments - Member payment history
db.payments.createIndex({ memberId: 1, paymentDate: -1 })

// Class Bookings - Upcoming classes for member
db.classBookings.createIndex({ memberId: 1, classDate: 1, status: 1 })

// Attendance - Member check-in history
db.attendance.createIndex({ memberId: 1, checkInTime: -1 })

// Notifications - Unread notifications for user
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })

// Messages - Conversation history
db.messages.createIndex({ conversationId: 1, createdAt: -1 })

// Audit Logs - User activity tracking
db.auditLogs.createIndex({ userId: 1, timestamp: -1 })
```

---

## Validation Rules

### Data Integrity Constraints

1. **Email Validation**: RFC 5322 compliant email format
2. **Phone Numbers**: International format with country code
3. **Dates**: 
   - `endDate` must be after `startDate`
   - `expiryDate` must be in the future
4. **Numeric Ranges**:
   - BMI: 10-100
   - Weight: 20-500 kg
   - Height: 50-300 cm
   - Rating: 1-5
5. **Enum Validation**: Strict enum values for status fields
6. **Required Fields**: Enforced at schema level
7. **Unique Constraints**: Email, member numbers, QR codes
8. **Referential Integrity**: Foreign keys must reference valid documents

### Business Logic Validation

1. **Membership Booking**: Cannot book if membership expired
2. **Class Capacity**: Cannot exceed class capacity
3. **Payment Amount**: Must match membership plan price
4. **Workout Date**: Cannot be in the future
5. **Check-out Time**: Must be after check-in time

---

## Migration Strategy

### Initial Setup

```javascript
// 1. Create database
use gym_management

// 2. Create collections with validation
db.createCollection("users", { validator: { /* schema */ } })

// 3. Create indexes
db.users.createIndex({ email: 1 }, { unique: true })

// 4. Seed initial data
// - Default admin user
// - Sample membership plans
// - Exercise library
```

### Version Control

- Schema version tracked in `schema_version` collection
- Migration scripts in `/migrations` folder
- Rollback procedures documented

---

**Schema Version**: 1.0.0  
**Last Updated**: 2026-01-29  
**Maintained By**: SDFitness Development Team
