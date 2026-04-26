# Security Documentation

> **Project**: SDFitness Gym Management System  
> **Last Updated**: 2026-01-29  
> **Security Level**: Production-Ready

---

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Input Validation](#input-validation)
- [File Upload Security](#file-upload-security)
- [Rate Limiting](#rate-limiting)
- [Session Management](#session-management)
- [GDPR Compliance](#gdpr-compliance)
- [Security Best Practices](#security-best-practices)
- [Incident Response](#incident-response)

---

## Authentication

### Password Security

#### Hashing Strategy
```javascript
// Using bcrypt with 10 salt rounds
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Hash password on registration/update
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Verify password on login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

#### Password Requirements
- **Minimum Length**: 8 characters
- **Complexity**: Must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)
- **Password History**: Cannot reuse last 5 passwords
- **Expiration**: Passwords expire after 90 days (optional for admins)

#### Password Reset Flow

```javascript
// 1. Generate secure reset token
const crypto = require('crypto');
const resetToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// 2. Store hashed token with expiration (15 minutes)
user.passwordResetToken = hashedToken;
user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
await user.save();

// 3. Send email with plain token
const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

// 4. Verify token on reset
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: { $gt: Date.now() }
});
```

**Security Measures**:
- Tokens expire after 15 minutes
- Tokens are single-use (deleted after successful reset)
- Rate limit: 3 reset requests per hour per email
- Email verification required before reset

---

### JWT Token Management

#### Token Structure

```javascript
// Access Token (short-lived)
const accessToken = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m', // 15 minutes
    issuer: 'sdfitness',
    audience: 'sdfitness-api'
  }
);

// Refresh Token (long-lived)
const refreshToken = jwt.sign(
  {
    userId: user._id,
    tokenVersion: user.tokenVersion // For invalidation
  },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: '7d' // 7 days
  }
);
```

#### Token Storage
- **Access Token**: Stored in memory (React state/context)
- **Refresh Token**: Stored in httpOnly cookie
  ```javascript
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  ```

#### Token Refresh Flow

```javascript
// Endpoint: POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    // Check token version (for invalidation)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

#### Token Invalidation
```javascript
// Logout: Increment token version to invalidate all tokens
user.tokenVersion += 1;
await user.save();

// Clear refresh token cookie
res.clearCookie('refreshToken');
```

---

### Two-Factor Authentication (2FA)

#### Setup Flow

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// 1. Generate secret
const secret = speakeasy.generateSecret({
  name: `SDFitness (${user.email})`,
  issuer: 'SDFitness'
});

// 2. Store secret (encrypted)
user.twoFactorSecret = encrypt(secret.base32);
user.twoFactorEnabled = false; // Not enabled until verified
await user.save();

// 3. Generate QR code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// 4. Return QR code to user
res.json({ qrCode: qrCodeUrl, secret: secret.base32 });
```

#### Verification Flow

```javascript
// Verify TOTP token
const verified = speakeasy.totp.verify({
  secret: decrypt(user.twoFactorSecret),
  encoding: 'base32',
  token: userProvidedToken,
  window: 2 // Allow 2 time steps before/after
});

if (verified) {
  user.twoFactorEnabled = true;
  await user.save();
}
```

#### Login with 2FA

```javascript
// 1. Verify password first
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

// 2. If 2FA enabled, require TOTP
if (user.twoFactorEnabled) {
  if (!totpToken) {
    return res.status(200).json({ requires2FA: true });
  }
  
  const verified = speakeasy.totp.verify({
    secret: decrypt(user.twoFactorSecret),
    encoding: 'base32',
    token: totpToken
  });
  
  if (!verified) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
}

// 3. Generate tokens
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);
```

---

## Authorization

### Role-Based Access Control (RBAC)

#### Role Hierarchy

```javascript
const ROLES = {
  MEMBER: 'member',
  TRAINER: 'trainer',
  RECEPTIONIST: 'receptionist',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

const ROLE_HIERARCHY = {
  member: 0,
  trainer: 1,
  receptionist: 2,
  manager: 3,
  admin: 4
};
```

#### Permission Matrix

| Resource | Member | Trainer | Receptionist | Manager | Admin |
|----------|--------|---------|--------------|---------|-------|
| Own Profile | Read, Update | Read, Update | Read, Update | Read, Update | Full |
| Other Profiles | - | Read (assigned) | Read | Read, Update | Full |
| Diet Plans | Own | Assigned members | - | Read | Full |
| Workouts | Own | Own + Assigned | - | Read | Full |
| Classes | Book, View | Create, Update, View | View | Full | Full |
| Payments | Own | - | Create, Read | Full | Full |
| Memberships | Own | - | Create, Read, Update | Full | Full |
| Equipment | View | View | Read, Update | Full | Full |
| Analytics | - | Own stats | Basic | Advanced | Full |
| Users | - | - | Create (members) | Create, Read, Update | Full |

#### Middleware Implementation

```javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// middleware/roleCheck.js
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Usage
router.get('/members', authMiddleware, requireRole('admin', 'manager'), getMembersController);
```

#### Resource-Level Authorization

```javascript
// Check if user can access specific resource
const canAccessMember = async (userId, memberId) => {
  const user = await User.findById(userId);
  const member = await Member.findById(memberId).populate('userId');
  
  // Admin/Manager can access all
  if (['admin', 'manager'].includes(user.role)) {
    return true;
  }
  
  // Member can access own profile
  if (user.role === 'member' && member.userId._id.equals(userId)) {
    return true;
  }
  
  // Trainer can access assigned members
  if (user.role === 'trainer') {
    const trainer = await Trainer.findOne({ userId: userId });
    if (member.assignedTrainerId?.equals(trainer._id)) {
      return true;
    }
  }
  
  return false;
};
```

---

## Data Protection

### Encryption at Rest

#### Database Encryption
```javascript
// MongoDB encryption at rest (Atlas)
// Enabled in MongoDB Atlas settings
// Uses AES-256 encryption

// Application-level field encryption for sensitive data
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Encrypt sensitive fields
user.twoFactorSecret = encrypt(secret);
user.ssn = encrypt(ssn); // If storing SSN
```

### Encryption in Transit

#### HTTPS/TLS Configuration

```javascript
// Production: Use Let's Encrypt or commercial SSL
// Enforce HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Helmet.js for security headers
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Data Masking

```javascript
// Mask sensitive data in logs and responses
function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name.substring(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
}

function maskCardNumber(cardNumber) {
  return cardNumber.replace(/\d(?=\d{4})/g, '*');
}

// Use in API responses
const sanitizeUser = (user) => ({
  ...user.toObject(),
  password: undefined,
  twoFactorSecret: undefined,
  passwordResetToken: undefined
});
```

---

## API Security

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### CSRF Protection

```javascript
const csrf = require('csurf');

// CSRF protection for state-changing operations
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to routes that modify data
app.use('/api/members', csrfProtection);
app.use('/api/payments', csrfProtection);

// Send CSRF token to client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### XSS Protection

```javascript
// 1. Input sanitization
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Sanitize user input

// 2. Output encoding
const escape = require('escape-html');

// Escape HTML in responses
const sanitizeOutput = (data) => {
  if (typeof data === 'string') {
    return escape(data);
  }
  if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      data[key] = sanitizeOutput(data[key]);
    });
  }
  return data;
};

// 3. Content Security Policy (via Helmet)
// Already configured in HTTPS section
```

### SQL/NoSQL Injection Prevention

```javascript
// 1. Use Mongoose (parameterized queries)
// GOOD ✓
const user = await User.findOne({ email: userEmail });

// BAD ✗ - Never use string concatenation
// const user = await User.findOne({ $where: `this.email == '${userEmail}'` });

// 2. Sanitize MongoDB operators
app.use(mongoSanitize({
  replaceWith: '_'
}));

// 3. Validate input types
const { body, validationResult } = require('express-validator');

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process login
  }
);
```

---

## Input Validation

### Validation Strategy

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Example: Member registration validation
router.post('/members',
  [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be 2-50 characters'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be 2-50 characters'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    
    body('phoneNumber')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
      .withMessage('Invalid phone number'),
    
    body('dateOfBirth')
      .isISO8601()
      .toDate()
      .custom((value) => {
        const age = (Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 13) throw new Error('Must be at least 13 years old');
        if (age > 120) throw new Error('Invalid date of birth');
        return true;
      }),
    
    body('height.value')
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be between 50-300 cm'),
    
    body('currentWeight.value')
      .isFloat({ min: 20, max: 500 })
      .withMessage('Weight must be between 20-500 kg'),
    
    body('fitnessGoals')
      .isArray({ min: 1 })
      .withMessage('At least one fitness goal required'),
    
    body('fitnessGoals.*')
      .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', 'strength', 'athletic_performance'])
      .withMessage('Invalid fitness goal')
  ],
  validate,
  createMemberController
);
```

### Custom Validators

```javascript
// Custom validator for unique email
body('email').custom(async (email) => {
  const user = await User.findOne({ email });
  if (user) {
    throw new Error('Email already in use');
  }
  return true;
});

// Custom validator for membership plan exists
body('planId').custom(async (planId) => {
  const plan = await MembershipPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new Error('Invalid membership plan');
  }
  return true;
});

// Custom validator for future date
body('endDate').custom((value, { req }) => {
  if (new Date(value) <= new Date(req.body.startDate)) {
    throw new Error('End date must be after start date');
  }
  return true;
});
```

---

## File Upload Security

### Configuration

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX allowed.'));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5 // Max 5 files per request
  },
  fileFilter: fileFilter
});

// Usage
router.post('/upload/profile-photo',
  authMiddleware,
  upload.single('photo'),
  async (req, res) => {
    try {
      // Virus scan (optional - use ClamAV)
      // await scanFile(req.file.path);
      
      // Upload to S3/Cloudinary
      const url = await uploadToCloud(req.file.path);
      
      // Delete temp file
      fs.unlinkSync(req.file.path);
      
      // Update user profile
      req.user.profilePhoto = url;
      await req.user.save();
      
      res.json({ url });
    } catch (error) {
      // Clean up on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }
);
```

### File Validation

```javascript
// Image validation (dimensions, format)
const sharp = require('sharp');

const validateImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Check dimensions
    if (metadata.width > 4000 || metadata.height > 4000) {
      throw new Error('Image dimensions too large');
    }
    
    // Check format
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new Error('Invalid image format');
    }
    
    return true;
  } catch (error) {
    throw new Error('Invalid image file');
  }
};

// PDF validation
const validatePDF = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const header = fileBuffer.toString('utf8', 0, 5);
  
  if (header !== '%PDF-') {
    throw new Error('Invalid PDF file');
  }
  
  return true;
};
```

---

## Rate Limiting

### Configuration

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later'
});

// AI generation rate limit
const aiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI generations per hour
  message: 'AI generation limit reached, please try again later'
});

// Password reset rate limit
const resetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:reset:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: 'Too many password reset attempts'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/diet-plans/generate', aiLimiter);
```

### IP-based Blocking

```javascript
// Track failed login attempts
const loginAttempts = new Map();

const trackLoginAttempt = (ip, success) => {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
  attempts.count++;
  
  if (attempts.count >= 10) {
    // Block IP for 24 hours
    blockIP(ip, 24 * 60 * 60 * 1000);
  }
  
  loginAttempts.set(ip, attempts);
};

// Middleware to check blocked IPs
const checkBlockedIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (isIPBlocked(ip)) {
    return res.status(403).json({ error: 'IP temporarily blocked' });
  }
  
  next();
};
```

---

## Session Management

### Session Configuration

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict'
  }
}));
```

### Session Timeout

```javascript
// Auto-logout after 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000;

const sessionTimeout = (req, res, next) => {
  if (req.session.lastActivity) {
    const now = Date.now();
    const timeSinceLastActivity = now - req.session.lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      req.session.destroy();
      return res.status(401).json({ error: 'Session expired' });
    }
  }
  
  req.session.lastActivity = Date.now();
  next();
};
```

---

## GDPR Compliance

### Data Privacy

#### User Rights Implementation

```javascript
// 1. Right to Access (Data Export)
router.get('/api/users/export-data', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  
  const userData = {
    profile: await User.findById(userId).select('-password'),
    member: await Member.findOne({ userId }),
    dietPlans: await DietPlan.find({ memberId: member._id }),
    workouts: await Workout.find({ memberId: member._id }),
    payments: await Payment.find({ memberId: member._id }),
    attendance: await Attendance.find({ memberId: member._id })
  };
  
  res.json(userData);
});

// 2. Right to Deletion
router.delete('/api/users/delete-account', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  
  // Soft delete or anonymize
  await User.findByIdAndUpdate(userId, {
    isActive: false,
    email: `deleted_${userId}@deleted.com`,
    firstName: 'Deleted',
    lastName: 'User',
    phoneNumber: '0000000000',
    deletedAt: new Date()
  });
  
  // Anonymize related data
  await Member.updateOne({ userId }, {
    $unset: {
      emergencyContact: 1,
      medicalConditions: 1,
      medications: 1
    }
  });
  
  res.json({ message: 'Account deleted successfully' });
});

// 3. Right to Rectification
// Standard update endpoints with audit logging

// 4. Right to Data Portability
// Export in JSON format (already implemented above)
```

### Consent Management

```javascript
// Track user consent
const ConsentSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  consentType: {
    type: String,
    enum: ['terms', 'privacy', 'marketing', 'analytics'],
    required: true
  },
  granted: { type: Boolean, required: true },
  grantedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

// Record consent
router.post('/api/users/consent', authMiddleware, async (req, res) => {
  const { consentType, granted } = req.body;
  
  await Consent.create({
    userId: req.user._id,
    consentType,
    granted,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ message: 'Consent recorded' });
});
```

### Data Retention Policy

```javascript
// Cron job to delete old data
const deleteOldData = async () => {
  const retentionPeriods = {
    notifications: 90, // days
    auditLogs: 365,
    deletedUsers: 30,
    expiredMemberships: 730 // 2 years
  };
  
  // Delete old notifications
  await Notification.deleteMany({
    createdAt: { $lt: new Date(Date.now() - retentionPeriods.notifications * 24 * 60 * 60 * 1000) }
  });
  
  // Delete old audit logs
  await AuditLog.deleteMany({
    timestamp: { $lt: new Date(Date.now() - retentionPeriods.auditLogs * 24 * 60 * 60 * 1000) }
  });
  
  // Permanently delete users marked for deletion
  await User.deleteMany({
    deletedAt: { $lt: new Date(Date.now() - retentionPeriods.deletedUsers * 24 * 60 * 60 * 1000) }
  });
};

// Run daily
cron.schedule('0 2 * * *', deleteOldData); // 2 AM daily
```

---

## Security Best Practices

### Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/gym_management

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Encryption Key (32 bytes)
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# AI API Keys
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket
AWS_REGION=us-east-1

# URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Security Headers Checklist

- ✅ `Strict-Transport-Security` (HSTS)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Content-Security-Policy`
- ✅ `Referrer-Policy: no-referrer`
- ✅ `Permissions-Policy`

### Dependency Security

```bash
# Regular security audits
npm audit
npm audit fix

# Use Snyk for continuous monitoring
npm install -g snyk
snyk test
snyk monitor

# Keep dependencies updated
npm outdated
npm update
```

### Logging Best Practices

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Don't log sensitive data
logger.info('User login', {
  userId: user._id,
  email: maskEmail(user.email), // Masked
  ip: req.ip,
  timestamp: new Date()
});

// Never log passwords, tokens, or full credit card numbers
```

---

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs, alerts, user reports
2. **Containment**: Isolate affected systems, revoke compromised tokens
3. **Investigation**: Analyze logs, identify breach scope
4. **Eradication**: Remove malicious code, patch vulnerabilities
5. **Recovery**: Restore systems, verify integrity
6. **Post-Incident**: Document lessons learned, update procedures

### Breach Notification

```javascript
// Template for security breach notification
const notifySecurityBreach = async (affectedUsers) => {
  const emailTemplate = `
    Subject: Important Security Notice
    
    Dear User,
    
    We are writing to inform you of a security incident that may have affected your account.
    
    What happened: [Brief description]
    What information was involved: [Specific data]
    What we're doing: [Actions taken]
    What you should do: [User actions]
    
    For questions, contact: security@sdfitness.com
  `;
  
  for (const user of affectedUsers) {
    await sendEmail(user.email, emailTemplate);
  }
  
  // Log notification
  await AuditLog.create({
    action: 'breach_notification_sent',
    affectedUsers: affectedUsers.length,
    timestamp: new Date()
  });
};
```

### Emergency Contacts

- **Security Team Lead**: security@sdfitness.com
- **System Administrator**: admin@sdfitness.com
- **Legal/Compliance**: legal@sdfitness.com

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS/SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authentication and authorization implemented
- [ ] CORS properly configured
- [ ] Security headers set (Helmet.js)
- [ ] File upload restrictions in place
- [ ] Database encryption enabled
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Dependency security audit passed
- [ ] Penetration testing completed
- [ ] GDPR compliance verified

### Post-Deployment

- [ ] Monitor error logs daily
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Security audit annually
- [ ] Backup restoration test quarterly
- [ ] Incident response drill annually

---

**Security Version**: 1.0.0  
**Last Security Audit**: 2026-01-29  
**Next Audit Due**: 2027-01-29
