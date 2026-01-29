# Testing Strategy

> **Project**: SDFitness Gym Management System  
> **Last Updated**: 2026-01-29  
> **Test Coverage Goal**: 80%+

---

## Table of Contents

- [Overview](#overview)
- [Testing Pyramid](#testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Load Testing](#load-testing)
- [Security Testing](#security-testing)
- [Test Data Management](#test-data-management)
- [CI/CD Integration](#cicd-integration)
- [Performance Benchmarking](#performance-benchmarking)

---

## Overview

### Testing Philosophy

- **Test Early, Test Often**: Catch bugs before they reach production
- **Automated Testing**: Minimize manual testing overhead
- **Fast Feedback**: Tests should run quickly
- **Reliable**: Tests should be deterministic and stable
- **Maintainable**: Tests should be easy to understand and update

### Coverage Goals

| Test Type | Coverage Goal | Priority |
|-----------|---------------|----------|
| Unit Tests | 80%+ | High |
| Integration Tests | 70%+ | High |
| E2E Tests | Critical paths | Medium |
| Load Tests | Key endpoints | Medium |
| Security Tests | OWASP Top 10 | High |

---

## Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /    \  - Critical user flows
     /------\  - Browser automation
    /        \ Integration Tests (30%)
   /          \ - API endpoints
  /            \ - Database operations
 /--------------\ Unit Tests (60%)
                  - Functions, utilities
                  - Business logic
```

---

## Unit Testing

### Setup

**Framework**: Jest  
**Coverage Tool**: Istanbul (built into Jest)

```bash
npm install --save-dev jest @types/jest ts-jest
```

**Configuration** (`jest.config.js`):

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
```

### Unit Test Examples

#### Testing Utilities

```javascript
// src/utils/__tests__/calculations.test.ts
import { calculateBMI, calculateTDEE, calculateMacros } from '../calculations';

describe('Calculation Utilities', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for metric units', () => {
      const result = calculateBMI(75, 180, 'kg', 'cm');
      expect(result).toBeCloseTo(23.15, 2);
    });

    it('should calculate BMI correctly for imperial units', () => {
      const result = calculateBMI(165, 70, 'lbs', 'inches');
      expect(result).toBeCloseTo(23.67, 2);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateBMI(0, 180, 'kg', 'cm')).toThrow('Invalid weight');
      expect(() => calculateBMI(75, 0, 'kg', 'cm')).toThrow('Invalid height');
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE for male', () => {
      const result = calculateTDEE({
        weight: 75,
        height: 180,
        age: 30,
        gender: 'male',
        activityLevel: 'moderately_active'
      });
      expect(result).toBeGreaterThan(2000);
      expect(result).toBeLessThan(3000);
    });

    it('should calculate TDEE for female', () => {
      const result = calculateTDEE({
        weight: 60,
        height: 165,
        age: 28,
        gender: 'female',
        activityLevel: 'lightly_active'
      });
      expect(result).toBeGreaterThan(1500);
      expect(result).toBeLessThan(2500);
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros with correct split', () => {
      const result = calculateMacros(2000, {
        protein: 30,
        carbs: 40,
        fats: 30
      });

      expect(result.protein.grams).toBe(150);
      expect(result.carbs.grams).toBe(200);
      expect(result.fats.grams).toBeCloseTo(66.67, 2);
    });

    it('should throw error if percentages do not sum to 100', () => {
      expect(() => calculateMacros(2000, {
        protein: 30,
        carbs: 40,
        fats: 20
      })).toThrow('Macro percentages must sum to 100');
    });
  });
});
```

#### Testing Services

```javascript
// src/services/__tests__/memberService.test.ts
import { MemberService } from '../memberService';
import { Member } from '../../models/Member';
import { User } from '../../models/User';

jest.mock('../../models/Member');
jest.mock('../../models/User');

describe('MemberService', () => {
  let memberService: MemberService;

  beforeEach(() => {
    memberService = new MemberService();
    jest.clearAllMocks();
  });

  describe('createMember', () => {
    it('should create member with valid data', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockMember = {
        _id: 'member123',
        userId: 'user123',
        memberNumber: 'GYM-2026-0001',
        save: jest.fn().mockResolvedValue(true)
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (Member.create as jest.Mock).mockResolvedValue(mockMember);

      const result = await memberService.createMember({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        height: { value: 180, unit: 'cm' },
        currentWeight: { value: 75, unit: 'kg' }
      });

      expect(result.memberNumber).toBe('GYM-2026-0001');
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(Member.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      await expect(memberService.createMember({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      })).rejects.toThrow('Email already exists');
    });
  });

  describe('updateHealthMetrics', () => {
    it('should update member health metrics and recalculate BMI/TDEE', async () => {
      const mockMember = {
        _id: 'member123',
        currentWeight: { value: 75, unit: 'kg' },
        height: { value: 180, unit: 'cm' },
        save: jest.fn().mockResolvedValue(true)
      };

      (Member.findById as jest.Mock).mockResolvedValue(mockMember);

      const result = await memberService.updateHealthMetrics('member123', {
        currentWeight: { value: 73, unit: 'kg' }
      });

      expect(result.bmi).toBeDefined();
      expect(result.tdee).toBeDefined();
      expect(mockMember.save).toHaveBeenCalled();
    });
  });
});
```

#### Testing Middleware

```javascript
// src/middleware/__tests__/auth.test.ts
import { authMiddleware } from '../auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should authenticate valid token', async () => {
    req.headers.authorization = 'Bearer validtoken';
    
    (jwt.verify as jest.Mock).mockReturnValue({
      userId: 'user123',
      email: 'test@example.com',
      role: 'member'
    });

    await authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user123');
    expect(next).toHaveBeenCalled();
  });

  it('should reject request without token', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- calculations.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="calculateBMI"
```

---

## Integration Testing

### Setup

**Framework**: Jest + Supertest  
**Database**: MongoDB Memory Server

```bash
npm install --save-dev supertest @types/supertest mongodb-memory-server
```

### Integration Test Examples

#### Testing API Endpoints

```javascript
// src/tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/User';
import { setupTestDB, teardownTestDB } from '../helpers/db';

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          role: 'member'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.userId).toBeDefined();

      // Verify user in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.password).not.toBe('SecurePass123!'); // Should be hashed
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890'
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith'
        })
        .expect(409);

      expect(response.body.error.code).toBe('ALREADY_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      
      // Check refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should enforce rate limiting', async () => {
      // Make 6 failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword'
          });
      }

      // 7th attempt should be rate limited
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(429);

      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
```

#### Testing Database Operations

```javascript
// src/tests/integration/member.test.ts
import request from 'supertest';
import { app } from '../../app';
import { Member } from '../../models/Member';
import { createTestUser, getAuthToken } from '../helpers/auth';

describe('Member API Integration Tests', () => {
  let authToken;
  let adminToken;
  let testMemberId;

  beforeAll(async () => {
    const member = await createTestUser('member');
    const admin = await createTestUser('admin');
    
    authToken = await getAuthToken(member.email, 'SecurePass123!');
    adminToken = await getAuthToken(admin.email, 'SecurePass123!');
  });

  describe('GET /api/v1/members/:id', () => {
    it('should get own member profile', async () => {
      const response = await request(app)
        .get(`/api/v1/members/${testMemberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.memberId).toBe(testMemberId);
      expect(response.body.data.userId.email).toBeDefined();
    });

    it('should reject unauthorized access to other member', async () => {
      const otherMember = await createTestUser('member');
      
      const response = await request(app)
        .get(`/api/v1/members/${otherMember.memberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin to access any member', async () => {
      const response = await request(app)
        .get(`/api/v1/members/${testMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.memberId).toBe(testMemberId);
    });
  });

  describe('PUT /api/v1/members/:id', () => {
    it('should update member health metrics', async () => {
      const response = await request(app)
        .put(`/api/v1/members/${testMemberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentWeight: { value: 73, unit: 'kg' },
          fitnessGoals: ['weight_loss', 'strength']
        })
        .expect(200);

      expect(response.body.data.bmi).toBeDefined();
      expect(response.body.data.tdee).toBeDefined();

      // Verify in database
      const member = await Member.findById(testMemberId);
      expect(member.currentWeight.value).toBe(73);
      expect(member.fitnessGoals).toContain('weight_loss');
    });
  });
});
```

### Test Database Helper

```javascript
// src/tests/helpers/db.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

---

## E2E Testing

### Setup

**Framework**: Playwright (recommended) or Cypress

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Configuration** (`playwright.config.ts`):

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ]
});
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register and login new user', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('.success-message')).toContainText('Registration successful');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Login with new credentials
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome, John');
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});

// e2e/diet-plan.spec.ts
test.describe('Diet Plan Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should generate AI diet plan', async ({ page }) => {
    // Navigate to diet plan generator
    await page.goto('/diet-plan/generate');
    
    // Fill form
    await page.selectOption('[name="fitnessGoal"]', 'weight_loss');
    await page.fill('[name="targetCalories"]', '2000');
    await page.fill('[name="budget"]', '100');
    await page.check('[name="dietaryPreferences"][value="vegetarian"]');
    
    // Generate plan
    await page.click('button:has-text("Generate Diet Plan")');
    
    // Wait for AI generation
    await page.waitForSelector('.diet-plan-result', { timeout: 30000 });
    
    // Verify plan details
    await expect(page.locator('.total-calories')).toContainText('2000');
    await expect(page.locator('.meal-card')).toHaveCount(5); // 5 meals per day
    await expect(page.locator('.shopping-list')).toBeVisible();
    
    // Save plan
    await page.click('button:has-text("Save Plan")');
    await expect(page.locator('.success-message')).toContainText('Diet plan saved');
  });
});
```

---

## Load Testing

### Setup

**Framework**: k6 (recommended) or Artillery

```bash
# Install k6
brew install k6  # macOS
# or
choco install k6  # Windows
```

### Load Test Examples

```javascript
// load-tests/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
  },
};

const BASE_URL = 'https://api.sdfitness.com/api/v1';

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123!'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'access token received': (r) => r.json('accessToken') !== undefined,
  });

  const token = loginRes.json('accessToken');

  // Get member profile
  const profileRes = http.get(`${BASE_URL}/members/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(profileRes, {
    'profile retrieved': (r) => r.status === 200,
  });

  // Get class schedule
  const classesRes = http.get(`${BASE_URL}/classes`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(classesRes, {
    'classes retrieved': (r) => r.status === 200,
  });

  sleep(1);
}
```

**Run Load Tests:**

```bash
k6 run load-tests/api-load.js

# With custom VUs and duration
k6 run --vus 100 --duration 30s load-tests/api-load.js

# Output to InfluxDB for visualization
k6 run --out influxdb=http://localhost:8086/k6 load-tests/api-load.js
```

---

## Security Testing

### OWASP ZAP

```bash
# Run ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.sdfitness.com \
  -r zap-report.html

# Run full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://api.sdfitness.com \
  -r zap-full-report.html
```

### Security Test Checklist

- [ ] SQL/NoSQL Injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization testing (privilege escalation)
- [ ] Rate limiting verification
- [ ] Input validation testing
- [ ] File upload security
- [ ] Session management testing
- [ ] Password policy enforcement

---

## Test Data Management

### Seed Data Scripts

```javascript
// src/tests/seeds/members.seed.ts
import { User } from '../../models/User';
import { Member } from '../../models/Member';
import bcrypt from 'bcrypt';

export const seedMembers = async () => {
  const members = [];

  for (let i = 1; i <= 50; i++) {
    const user = await User.create({
      email: `member${i}@test.com`,
      password: await bcrypt.hash('TestPass123!', 10),
      firstName: `Member`,
      lastName: `${i}`,
      phoneNumber: `+123456789${i.toString().padStart(2, '0')}`,
      role: 'member'
    });

    const member = await Member.create({
      userId: user._id,
      memberNumber: `GYM-2026-${i.toString().padStart(4, '0')}`,
      dateOfBirth: new Date(1990, 0, i),
      gender: i % 2 === 0 ? 'male' : 'female',
      height: { value: 160 + i, unit: 'cm' },
      currentWeight: { value: 60 + i, unit: 'kg' },
      fitnessGoals: ['weight_loss'],
      activityLevel: 'moderately_active'
    });

    members.push(member);
  }

  return members;
};
```

**Run Seeds:**

```bash
npm run seed:dev
npm run seed:test
npm run seed:clear
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
  
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/test
  
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Performance Benchmarking

### Benchmark Tests

```javascript
// src/tests/benchmarks/calculations.bench.ts
import Benchmark from 'benchmark';
import { calculateBMI, calculateTDEE } from '../../utils/calculations';

const suite = new Benchmark.Suite;

suite
  .add('calculateBMI', () => {
    calculateBMI(75, 180, 'kg', 'cm');
  })
  .add('calculateTDEE', () => {
    calculateTDEE({
      weight: 75,
      height: 180,
      age: 30,
      gender: 'male',
      activityLevel: 'moderately_active'
    });
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

**Run Benchmarks:**

```bash
npm run benchmark
```

---

## Test Scripts

**package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:load": "k6 run load-tests/api-load.js",
    "test:security": "npm run test:security:zap",
    "test:security:zap": "docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:5000",
    "benchmark": "ts-node src/tests/benchmarks/*.bench.ts",
    "seed:dev": "ts-node src/tests/seeds/index.ts",
    "seed:test": "NODE_ENV=test ts-node src/tests/seeds/index.ts",
    "seed:clear": "ts-node src/tests/seeds/clear.ts"
  }
}
```

---

## Best Practices

### Writing Good Tests

1. **AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Test one thing at a time
3. **Descriptive Names**: Test names should describe what they test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep tests fast to encourage frequent running
6. **Clean Up**: Always clean up test data

### Test Naming Convention

```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Mocking Best Practices

- Mock external dependencies (APIs, databases)
- Don't mock what you're testing
- Use jest.mock() for module mocking
- Clear mocks between tests

---

**Testing Version**: 1.0.0  
**Last Updated**: 2026-01-29  
**Maintained By**: SDFitness QA Team
