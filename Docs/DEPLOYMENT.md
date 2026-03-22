# Deployment & DevOps Guide

> **Project**: SDFitness Gym Management System  
> **Last Updated**: 2026-01-29  
> **Target Platform**: AWS / DigitalOcean / Vercel

---

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Deployment Checklist](#deployment-checklist)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Rollback Procedures](#rollback-procedures)

---

## Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer (ALB)                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│  Frontend App  │      │   Backend API   │
│   (Vercel)     │      │   (EC2/ECS)     │
└────────────────┘      └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐      ┌────────▼────────┐
            │  MongoDB Atlas  │      │   Redis Cache   │
            │   (Database)    │      │  (ElastiCache)  │
            └─────────────────┘      └─────────────────┘
                    │
            ┌───────▼────────┐
            │   S3 Bucket    │
            │ (File Storage) │
            └────────────────┘
```

### Environments

| Environment | Purpose | URL | Auto-Deploy |
|-------------|---------|-----|-------------|
| **Development** | Local development | localhost | No |
| **Staging** | Pre-production testing | staging.sdfitness.com | Yes (develop branch) |
| **Production** | Live application | sdfitness.com | Yes (main branch) |

---

## Environment Setup

### Development Environment

**Prerequisites:**
- Node.js 18+ LTS
- MongoDB 6+
- Redis 7+
- npm or yarn

**Setup Steps:**

```bash
# Clone repository
git clone https://github.com/sdfitness/gym-management.git
cd gym-management

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
nano .env

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:6

# Start Redis (Docker)
docker run -d -p 6379:6379 --name redis redis:7

# Run database migrations
npm run migrate

# Seed development data
npm run seed:dev

# Start development server
npm run dev
```

**Environment Variables (.env.development):**

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/sdfitness_dev
MONGODB_TEST_URI=mongodb://localhost:27017/sdfitness_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=dev_encryption_key_32_chars_min

# Session
SESSION_SECRET=dev_session_secret_change_in_production

# Frontend URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Email (Development - use Mailtrap)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@sdfitness.com

# AI Services (Development)
OPENAI_API_KEY=sk-dev-key
OPENAI_MODEL=gpt-4

# Payment Gateway (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# AWS S3 (Development)
AWS_ACCESS_KEY_ID=dev_access_key
AWS_SECRET_ACCESS_KEY=dev_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=sdfitness-dev

# Logging
LOG_LEVEL=debug
```

---

### Staging Environment

**Infrastructure:**
- AWS EC2 t3.medium (Backend)
- MongoDB Atlas M10 (Database)
- AWS ElastiCache (Redis)
- Vercel (Frontend)

**Environment Variables (.env.staging):**

```bash
NODE_ENV=staging
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://staging_user:password@cluster.mongodb.net/sdfitness_staging

# Redis (ElastiCache)
REDIS_HOST=staging-redis.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=staging_redis_password

# JWT (Use strong secrets)
JWT_SECRET=staging_jwt_secret_64_chars_minimum_random_string
JWT_REFRESH_SECRET=staging_refresh_secret_64_chars_minimum_random_string

# URLs
CLIENT_URL=https://staging.sdfitness.com
ADMIN_URL=https://admin-staging.sdfitness.com
API_URL=https://api-staging.sdfitness.com

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.staging_api_key
EMAIL_FROM=noreply@sdfitness.com

# AI Services
OPENAI_API_KEY=sk-staging-key

# Payment (Test Mode)
STRIPE_SECRET_KEY=sk_test_staging_...

# AWS S3
AWS_S3_BUCKET=sdfitness-staging

# Monitoring
SENTRY_DSN=https://staging@sentry.io/project
NEW_RELIC_LICENSE_KEY=staging_license_key
```

---

### Production Environment

**Infrastructure:**
- AWS ECS Fargate (Backend - Auto-scaling)
- MongoDB Atlas M30 (Database - Replica Set)
- AWS ElastiCache (Redis - Cluster Mode)
- AWS CloudFront (CDN)
- Vercel (Frontend)

**Environment Variables (.env.production):**

```bash
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas - Production Cluster)
MONGODB_URI=mongodb+srv://prod_user:secure_password@prod-cluster.mongodb.net/sdfitness?retryWrites=true&w=majority

# Redis (ElastiCache Cluster)
REDIS_HOST=prod-redis.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=production_redis_secure_password

# JWT (Strong secrets - 64+ chars)
JWT_SECRET=production_jwt_secret_use_crypto_random_bytes_64_chars
JWT_REFRESH_SECRET=production_refresh_secret_use_crypto_random_bytes_64_chars

# URLs
CLIENT_URL=https://sdfitness.com
ADMIN_URL=https://admin.sdfitness.com
API_URL=https://api.sdfitness.com

# Email (SendGrid Production)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.production_api_key
EMAIL_FROM=noreply@sdfitness.com

# AI Services
OPENAI_API_KEY=sk-production-key

# Payment (Live Mode)
STRIPE_SECRET_KEY=sk_live_production_...
STRIPE_PUBLISHABLE_KEY=pk_live_production_...
STRIPE_WEBHOOK_SECRET=whsec_production_...

# AWS S3
AWS_ACCESS_KEY_ID=production_access_key
AWS_SECRET_ACCESS_KEY=production_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=sdfitness-production

# Monitoring
SENTRY_DSN=https://production@sentry.io/project
NEW_RELIC_LICENSE_KEY=production_license_key
DATADOG_API_KEY=production_datadog_key

# Logging
LOG_LEVEL=info
```

---

## Database Configuration

### MongoDB Atlas Setup

1. **Create Cluster**
   ```bash
   # Production: M30 or higher
   # Staging: M10
   # Region: Same as application servers
   ```

2. **Configure Network Access**
   ```bash
   # Add IP whitelist
   # For AWS: Add VPC CIDR block
   # For development: Add your IP
   ```

3. **Create Database User**
   ```bash
   # Username: sdfitness_prod
   # Password: Strong random password (32+ chars)
   # Role: readWrite on sdfitness database
   ```

4. **Enable Backup**
   ```bash
   # Continuous backup enabled
   # Point-in-time recovery: Last 24 hours
   # Snapshot schedule: Daily at 2 AM UTC
   ```

### Database Indexes

```javascript
// Run in production after deployment
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.members.createIndex({ userId: 1 }, { unique: true });
db.members.createIndex({ memberNumber: 1 }, { unique: true });
db.members.createIndex({ status: 1 });
db.members.createIndex({ 'userId': 1, 'status': 1 });

db.memberships.createIndex({ memberId: 1 });
db.memberships.createIndex({ planId: 1 });
db.memberships.createIndex({ endDate: 1 });
db.memberships.createIndex({ status: 1 });

db.payments.createIndex({ memberId: 1 });
db.payments.createIndex({ paymentDate: -1 });
db.payments.createIndex({ status: 1 });

db.attendance.createIndex({ memberId: 1, date: -1 });
db.attendance.createIndex({ date: -1 });

db.classes.createIndex({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
db.classes.createIndex({ trainerId: 1 });

db.classBookings.createIndex({ classId: 1, classDate: 1 });
db.classBookings.createIndex({ memberId: 1 });
db.classBookings.createIndex({ status: 1 });

db.dietPlans.createIndex({ memberId: 1 });
db.dietPlans.createIndex({ isActive: 1 });

db.workouts.createIndex({ memberId: 1, workoutDate: -1 });

db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ receiverId: 1, isRead: 1 });

db.auditLogs.createIndex({ userId: 1, timestamp: -1 });
db.auditLogs.createIndex({ action: 1, timestamp: -1 });
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security scan completed (OWASP ZAP)
- [ ] Performance testing completed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backup verified
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Load balancer health checks configured

### Deployment Steps

#### Backend Deployment (AWS ECS)

```bash
# 1. Build Docker image
docker build -t sdfitness-api:latest .

# 2. Tag image
docker tag sdfitness-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/sdfitness-api:latest

# 3. Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/sdfitness-api:latest

# 4. Update ECS service
aws ecs update-service --cluster sdfitness-prod --service api --force-new-deployment

# 5. Monitor deployment
aws ecs wait services-stable --cluster sdfitness-prod --services api
```

#### Frontend Deployment (Vercel)

```bash
# Automatic deployment on git push to main
# Or manual deployment:
vercel --prod
```

### Post-Deployment

- [ ] Health check endpoints responding
- [ ] Smoke tests passing
- [ ] Error rates normal (<1%)
- [ ] Response times acceptable (<500ms p95)
- [ ] Database connections stable
- [ ] Redis cache working
- [ ] File uploads working
- [ ] Email sending working
- [ ] Payment processing working
- [ ] AI generation working
- [ ] Monitoring dashboards updated
- [ ] Documentation updated

---

## Monitoring & Logging

### Application Monitoring

**Tool**: New Relic / Datadog

**Metrics to Monitor:**

```javascript
// Performance Metrics
- Response time (p50, p95, p99)
- Throughput (requests per second)
- Error rate
- Apdex score

// Resource Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

// Business Metrics
- Active users
- New registrations
- Payments processed
- AI generations
- Class bookings
```

**Setup:**

```javascript
// src/monitoring/newrelic.ts
import newrelic from 'newrelic';

export const trackCustomMetric = (name: string, value: number) => {
  newrelic.recordMetric(name, value);
};

export const trackTransaction = (name: string, callback: Function) => {
  return newrelic.startBackgroundTransaction(name, callback);
};

// Track business metrics
trackCustomMetric('Custom/Registrations', 1);
trackCustomMetric('Custom/Payments/Amount', paymentAmount);
trackCustomMetric('Custom/AI/Generations', 1);
```

### Error Tracking

**Tool**: Sentry

**Setup:**

```javascript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  }
});

// Track errors
try {
  // Code that might throw
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      userId: user.id
    }
  });
}
```

### Logging

**Tool**: Winston + CloudWatch / ELK Stack

**Configuration:**

```javascript
// src/utils/logger.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'sdfitness-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new CloudWatchTransport({
      logGroupName: '/aws/ecs/sdfitness-api',
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION
    })
  ]
});

export default logger;

// Usage
logger.info('User registered', { userId, email });
logger.error('Payment failed', { error, userId, amount });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

### Health Check Endpoints

```javascript
// src/routes/health.ts
import express from 'express';
import mongoose from 'mongoose';
import redis from '../config/redis';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed health check
router.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'ok'
    }
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.checks.database = 'ok';
    } else {
      health.checks.database = 'error';
      health.status = 'degraded';
    }
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  // Check Memory
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
    health.checks.memory = 'warning';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

### Alerts Configuration

**CloudWatch Alarms:**

```yaml
# High Error Rate
- Metric: HTTPCode_Target_5XX_Count
  Threshold: > 10 in 5 minutes
  Action: SNS notification + PagerDuty

# High Response Time
- Metric: TargetResponseTime
  Threshold: > 1000ms (p95)
  Action: SNS notification

# Low Healthy Hosts
- Metric: HealthyHostCount
  Threshold: < 2
  Action: SNS notification + PagerDuty

# High CPU
- Metric: CPUUtilization
  Threshold: > 80% for 10 minutes
  Action: SNS notification + Auto-scaling

# Database Connections
- Metric: DatabaseConnections
  Threshold: > 90% of max
  Action: SNS notification
```

---

## Backup & Recovery

### Backup Strategy

**MongoDB Atlas:**
- **Continuous Backup**: Enabled
- **Point-in-Time Recovery**: Last 24 hours
- **Snapshot Schedule**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Cross-Region Backup**: Enabled (us-west-2)

**S3 Files:**
- **Versioning**: Enabled
- **Lifecycle Policy**: 
  - Standard: 0-30 days
  - Infrequent Access: 30-90 days
  - Glacier: 90+ days
- **Cross-Region Replication**: Enabled

**Configuration Backup:**
```bash
# Backup environment variables
aws secretsmanager get-secret-value --secret-id sdfitness/prod/env > backup/env-$(date +%Y%m%d).json

# Backup database schema
mongodump --uri="$MONGODB_URI" --out=backup/db-$(date +%Y%m%d)

# Backup to S3
aws s3 sync backup/ s3://sdfitness-backups/$(date +%Y%m%d)/
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 4 hours  
**RPO (Recovery Point Objective)**: 1 hour

**Recovery Steps:**

1. **Assess Damage**
   ```bash
   # Check system status
   aws ecs describe-services --cluster sdfitness-prod --services api
   
   # Check database status
   # MongoDB Atlas Dashboard
   
   # Check recent backups
   aws s3 ls s3://sdfitness-backups/ --recursive
   ```

2. **Restore Database**
   ```bash
   # Restore from MongoDB Atlas snapshot
   # Via Atlas UI: Clusters > Backup > Restore
   
   # Or restore from mongodump
   mongorestore --uri="$MONGODB_URI" --drop backup/db-20260129/
   ```

3. **Restore Application**
   ```bash
   # Rollback to previous version
   aws ecs update-service --cluster sdfitness-prod --service api \
     --task-definition sdfitness-api:previous-version
   
   # Or redeploy from known good commit
   git checkout <last-known-good-commit>
   # Follow deployment steps
   ```

4. **Verify Recovery**
   ```bash
   # Run smoke tests
   npm run test:smoke
   
   # Check health endpoints
   curl https://api.sdfitness.com/health/detailed
   
   # Verify critical functions
   - User login
   - Payment processing
   - Class booking
   - AI generation
   ```

5. **Post-Recovery**
   - [ ] Document incident
   - [ ] Notify stakeholders
   - [ ] Review and improve procedures
   - [ ] Update runbooks

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Security scan
        run: npm audit --audit-level=high

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: sdfitness-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster sdfitness-prod \
            --service api \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster sdfitness-prod \
            --services api
      
      - name: Run smoke tests
        run: |
          curl -f https://api.sdfitness.com/health || exit 1
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Security Hardening

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.sdfitness.com;

    ssl_certificate /etc/letsencrypt/live/api.sdfitness.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sdfitness.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Firewall Rules

```bash
# AWS Security Group
# Inbound Rules:
- Port 443 (HTTPS): 0.0.0.0/0
- Port 80 (HTTP): 0.0.0.0/0 (redirect to 443)
- Port 22 (SSH): Your IP only

# Outbound Rules:
- All traffic: 0.0.0.0/0
```

### Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name sdfitness/prod/database \
  --secret-string '{"username":"admin","password":"secure_password"}'

# Retrieve in application
const secret = await secretsManager.getSecretValue({
  SecretId: 'sdfitness/prod/database'
}).promise();
```

---

## Performance Optimization

### CDN Configuration (CloudFront)

```javascript
// CloudFront distribution settings
{
  "Origins": [{
    "DomainName": "api.sdfitness.com",
    "CustomHeaders": [{
      "HeaderName": "X-CDN-Secret",
      "HeaderValue": "secret_value"
    }]
  }],
  "CacheBehaviors": [{
    "PathPattern": "/api/v1/public/*",
    "MinTTL": 3600,
    "MaxTTL": 86400,
    "DefaultTTL": 7200
  }],
  "Compress": true
}
```

### Database Optimization

```javascript
// Connection pooling
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});

// Query optimization
// Use lean() for read-only queries
const members = await Member.find({ status: 'active' }).lean();

// Use select() to limit fields
const members = await Member.find().select('firstName lastName email');

// Use indexes
const member = await Member.findOne({ memberNumber: 'GYM-2026-0001' });
```

### Caching Strategy

```javascript
// Redis caching
import redis from './config/redis';

// Cache member profile
const getMemberProfile = async (memberId) => {
  const cacheKey = `member:${memberId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const member = await Member.findById(memberId);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(member));
  
  return member;
};
```

---

## Rollback Procedures

### Application Rollback

```bash
# 1. Identify last known good version
aws ecs describe-task-definition --task-definition sdfitness-api

# 2. Rollback to previous version
aws ecs update-service \
  --cluster sdfitness-prod \
  --service api \
  --task-definition sdfitness-api:42  # Previous version

# 3. Monitor rollback
aws ecs wait services-stable \
  --cluster sdfitness-prod \
  --services api

# 4. Verify health
curl https://api.sdfitness.com/health/detailed
```

### Database Rollback

```bash
# 1. Stop application
aws ecs update-service --cluster sdfitness-prod --service api --desired-count 0

# 2. Restore database from backup
mongorestore --uri="$MONGODB_URI" --drop backup/db-20260129/

# 3. Restart application
aws ecs update-service --cluster sdfitness-prod --service api --desired-count 3

# 4. Verify data integrity
npm run verify:data
```

---

## Production Checklist

### Before Go-Live

- [ ] Load testing completed (500+ concurrent users)
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] SSL certificates installed and valid
- [ ] DNS configured correctly
- [ ] CDN configured and tested
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Backup verified
- [ ] Disaster recovery plan tested
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Legal review completed (Terms, Privacy Policy)
- [ ] GDPR compliance verified
- [ ] Payment gateway in live mode
- [ ] Email templates finalized
- [ ] Mobile app submitted to stores (if applicable)

### Launch Day

- [ ] Final backup taken
- [ ] Monitoring team on standby
- [ ] Support team ready
- [ ] Communication plan ready
- [ ] Rollback plan ready
- [ ] Deploy to production
- [ ] Smoke tests passing
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify critical user flows
- [ ] Announce launch

### Post-Launch (First 24 Hours)

- [ ] Monitor error rates continuously
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Verify payment processing
- [ ] Check email delivery
- [ ] Monitor database performance
- [ ] Check backup completion
- [ ] Review logs for issues
- [ ] Document any incidents
- [ ] Plan improvements

---

**Deployment Version**: 1.0.0  
**Last Updated**: 2026-01-29  
**Maintained By**: SDFitness DevOps Team  
**On-Call**: devops@sdfitness.com
