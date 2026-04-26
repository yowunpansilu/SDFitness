#!/usr/bin/env node

/**
 * Phase 1 Documentation Validation Script
 * Tests the completeness and validity of foundation documentation
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}\n${'='.repeat(50)}`)
};

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.projectRoot = process.cwd();
  }

  // Check if file exists
  fileExists(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.existsSync(fullPath);
  }

  // Read file content
  readFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  // Validate DATABASE_SCHEMA.md
  validateDatabaseSchema() {
    log.section('Validating DATABASE_SCHEMA.md');

    const filePath = 'DATABASE_SCHEMA.md';
    
    if (!this.fileExists(filePath)) {
      this.errors.push('DATABASE_SCHEMA.md not found');
      log.error('File not found');
      return;
    }

    const content = this.readFile(filePath);
    
    // Required collections
    const requiredCollections = [
      'users', 'members', 'trainers', 'memberships', 'membershipPlans',
      'dietPlans', 'workouts', 'workoutTemplates', 'exercises',
      'classes', 'classBookings', 'payments', 'attendance', 'equipment',
      'notifications', 'messages', 'announcements', 'reviews',
      'supportTickets', 'auditLogs'
    ];

    let foundCollections = 0;
    requiredCollections.forEach(collection => {
      const regex = new RegExp(`###.*${collection}.*collection`, 'i');
      if (regex.test(content)) {
        foundCollections++;
        this.successes.push(`Collection defined: ${collection}`);
      } else {
        this.warnings.push(`Collection missing or incomplete: ${collection}`);
      }
    });

    log.info(`Found ${foundCollections}/${requiredCollections.length} collections`);

    // Check for key sections
    const requiredSections = [
      'Schema Overview',
      'Collections',
      'Relationships',
      'Indexes',
      'Validation Rules'
    ];

    requiredSections.forEach(section => {
      if (content.includes(section)) {
        log.success(`Section found: ${section}`);
      } else {
        this.warnings.push(`Section missing: ${section}`);
        log.warning(`Section missing: ${section}`);
      }
    });

    // Check for Mongoose schema examples
    if (content.includes('ObjectId') && content.includes('type:') && content.includes('required:')) {
      log.success('Mongoose schema syntax detected');
    } else {
      this.warnings.push('Mongoose schema syntax may be incomplete');
      log.warning('Mongoose schema syntax may be incomplete');
    }

    // Check for indexes
    if (content.includes('createIndex') || content.includes('Indexes')) {
      log.success('Index definitions found');
    } else {
      this.warnings.push('Index definitions missing');
      log.warning('Index definitions missing');
    }

    // File size check (should be substantial)
    const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    if (sizeKB > 30) {
      log.success(`File size: ${sizeKB.toFixed(2)} KB (comprehensive)`);
    } else {
      this.warnings.push(`File size only ${sizeKB.toFixed(2)} KB (may be incomplete)`);
      log.warning(`File size: ${sizeKB.toFixed(2)} KB (may be incomplete)`);
    }
  }

  // Validate SECURITY.md
  validateSecurity() {
    log.section('Validating SECURITY.md');

    const filePath = 'SECURITY.md';
    
    if (!this.fileExists(filePath)) {
      this.errors.push('SECURITY.md not found');
      log.error('File not found');
      return;
    }

    const content = this.readFile(filePath);

    // Required security topics
    const requiredTopics = [
      'Authentication',
      'Authorization',
      'JWT',
      'Password',
      'Encryption',
      'CORS',
      'CSRF',
      'XSS',
      'Rate Limiting',
      'GDPR',
      'Two-Factor',
      'Session'
    ];

    let foundTopics = 0;
    requiredTopics.forEach(topic => {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        foundTopics++;
        log.success(`Topic covered: ${topic}`);
      } else {
        this.warnings.push(`Security topic missing: ${topic}`);
        log.warning(`Topic missing: ${topic}`);
      }
    });

    log.info(`Found ${foundTopics}/${requiredTopics.length} security topics`);

    // Check for code examples
    if (content.includes('```javascript') || content.includes('```js')) {
      log.success('Code examples included');
    } else {
      this.warnings.push('No code examples found');
      log.warning('No code examples found');
    }

    // Check for specific security measures
    const securityMeasures = [
      'bcrypt',
      'helmet',
      'express-validator',
      'express-rate-limit',
      'SALT_ROUNDS',
      'httpOnly',
      'sameSite'
    ];

    let foundMeasures = 0;
    securityMeasures.forEach(measure => {
      if (content.includes(measure)) {
        foundMeasures++;
      }
    });

    if (foundMeasures >= securityMeasures.length * 0.7) {
      log.success(`Security implementation details: ${foundMeasures}/${securityMeasures.length} found`);
    } else {
      this.warnings.push('Some security implementation details missing');
      log.warning(`Only ${foundMeasures}/${securityMeasures.length} security measures found`);
    }

    // File size check
    const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    if (sizeKB > 25) {
      log.success(`File size: ${sizeKB.toFixed(2)} KB (comprehensive)`);
    } else {
      this.warnings.push(`File size only ${sizeKB.toFixed(2)} KB (may be incomplete)`);
      log.warning(`File size: ${sizeKB.toFixed(2)} KB (may be incomplete)`);
    }
  }

  // Validate README.md
  validateReadme() {
    log.section('Validating README.md');

    const filePath = 'README.md';
    
    if (!this.fileExists(filePath)) {
      this.errors.push('README.md not found');
      log.error('File not found');
      return;
    }

    const content = this.readFile(filePath);

    // Check for key sections
    const requiredSections = [
      'Overview',
      'Features',
      'Tech Stack',
      'Installation',
      'Configuration',
      'Running',
      'API Documentation',
      'Database Schema'
    ];

    requiredSections.forEach(section => {
      if (content.includes(section)) {
        log.success(`Section found: ${section}`);
      } else {
        this.warnings.push(`README section missing: ${section}`);
        log.warning(`Section missing: ${section}`);
      }
    });

    // Check for references to new documentation
    if (content.includes('DATABASE_SCHEMA.md')) {
      log.success('References DATABASE_SCHEMA.md');
    } else {
      this.warnings.push('Should reference DATABASE_SCHEMA.md');
      log.warning('Should reference DATABASE_SCHEMA.md');
    }

    if (content.includes('SECURITY.md')) {
      log.success('References SECURITY.md');
    } else {
      this.warnings.push('Should reference SECURITY.md');
      log.warning('Should reference SECURITY.md');
    }
  }

  // Validate task.md artifact
  validateTaskFile() {
    log.section('Validating task.md');

    const filePath = '.gemini/antigravity/brain/26e6e74b-c6b1-4bdc-9238-1ab6424e6aa0/task.md';
    
    if (!this.fileExists(filePath)) {
      this.warnings.push('task.md artifact not found (may be in different location)');
      log.warning('task.md not found in expected location');
      return;
    }

    const content = this.readFile(filePath);

    // Check for phase structure
    const phases = [
      'Phase 1',
      'Phase 2',
      'Phase 3',
      'Phase 4',
      'Phase 5',
      'Phase 6',
      'Phase 7'
    ];

    phases.forEach(phase => {
      if (content.includes(phase)) {
        log.success(`${phase} defined`);
      } else {
        this.warnings.push(`${phase} missing`);
        log.warning(`${phase} missing`);
      }
    });

    // Check for shadcn/ui mentions
    if (content.includes('shadcn')) {
      log.success('shadcn/ui components specified');
    } else {
      this.warnings.push('shadcn/ui not mentioned');
      log.warning('shadcn/ui not mentioned');
    }

    // Check for task checkboxes
    const checkboxCount = (content.match(/- \[ \]/g) || []).length;
    if (checkboxCount > 50) {
      log.success(`${checkboxCount} tasks defined`);
    } else {
      this.warnings.push(`Only ${checkboxCount} tasks found`);
      log.warning(`Only ${checkboxCount} tasks found (expected 50+)`);
    }
  }

  // Generate report
  generateReport() {
    log.section('Validation Summary');

    console.log(`\n${COLORS.green}Successes: ${this.successes.length}${COLORS.reset}`);
    console.log(`${COLORS.yellow}Warnings: ${this.warnings.length}${COLORS.reset}`);
    console.log(`${COLORS.red}Errors: ${this.errors.length}${COLORS.reset}\n`);

    if (this.errors.length > 0) {
      console.log(`${COLORS.red}ERRORS:${COLORS.reset}`);
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log();
    }

    if (this.warnings.length > 0 && this.warnings.length <= 10) {
      console.log(`${COLORS.yellow}WARNINGS:${COLORS.reset}`);
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log();
    } else if (this.warnings.length > 10) {
      console.log(`${COLORS.yellow}WARNINGS (showing first 10):${COLORS.reset}`);
      this.warnings.slice(0, 10).forEach(warning => console.log(`  - ${warning}`));
      console.log(`  ... and ${this.warnings.length - 10} more\n`);
    }

    // Overall status
    if (this.errors.length === 0 && this.warnings.length < 5) {
      log.success('Phase 1 documentation is EXCELLENT! ✨');
      return 0;
    } else if (this.errors.length === 0 && this.warnings.length < 15) {
      log.info('Phase 1 documentation is GOOD. Minor improvements suggested.');
      return 0;
    } else if (this.errors.length === 0) {
      log.warning('Phase 1 documentation is ACCEPTABLE. Several improvements needed.');
      return 0;
    } else {
      log.error('Phase 1 documentation is INCOMPLETE. Critical files missing.');
      return 1;
    }
  }

  // Run all validations
  run() {
    console.log(`\n${COLORS.cyan}╔════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}║  Phase 1 Documentation Validation Script      ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}║  SDFitness Gym Management System               ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}╚════════════════════════════════════════════════╝${COLORS.reset}\n`);

    this.validateDatabaseSchema();
    this.validateSecurity();
    this.validateReadme();
    this.validateTaskFile();

    return this.generateReport();
  }
}

// Run validator
const validator = new DocumentationValidator();
const exitCode = validator.run();
process.exit(exitCode);
