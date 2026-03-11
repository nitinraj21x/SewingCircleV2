#!/usr/bin/env node

/**
 * Deployment Readiness Checker
 * 
 * This script checks if your application is ready for deployment
 * by verifying required files, dependencies, and configurations.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Deployment Readiness...\n');
console.log('='.repeat(60));

let errors = [];
let warnings = [];
let passed = 0;

// Check function
function check(name, condition, errorMsg, isWarning = false) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    if (isWarning) {
      console.log(`⚠️  ${name}`);
      warnings.push(errorMsg);
    } else {
      console.log(`❌ ${name}`);
      errors.push(errorMsg);
    }
  }
}

// Backend Checks
console.log('\n📦 Backend Checks:');
console.log('-'.repeat(60));

const backendPath = path.join(__dirname, '../backend');
check(
  'Backend directory exists',
  fs.existsSync(backendPath),
  'Backend directory not found'
);

check(
  'Backend package.json exists',
  fs.existsSync(path.join(backendPath, 'package.json')),
  'Backend package.json not found'
);

check(
  'Backend server.js exists',
  fs.existsSync(path.join(backendPath, 'server.js')),
  'Backend server.js not found'
);

check(
  'Backend .gitignore exists',
  fs.existsSync(path.join(backendPath, '.gitignore')),
  'Backend .gitignore not found - create one to avoid committing sensitive files',
  true
);

// Check if .env is in .gitignore
if (fs.existsSync(path.join(backendPath, '.gitignore'))) {
  const gitignore = fs.readFileSync(path.join(backendPath, '.gitignore'), 'utf8');
  check(
    '.env is in .gitignore',
    gitignore.includes('.env'),
    '.env should be in .gitignore to avoid committing secrets'
  );
}

// Frontend Checks
console.log('\n🎨 Frontend Checks:');
console.log('-'.repeat(60));

const frontendPath = path.join(__dirname, '../frontend');
check(
  'Frontend directory exists',
  fs.existsSync(frontendPath),
  'Frontend directory not found'
);

check(
  'Frontend package.json exists',
  fs.existsSync(path.join(frontendPath, 'package.json')),
  'Frontend package.json not found'
);

check(
  'Frontend index.html exists',
  fs.existsSync(path.join(frontendPath, 'index.html')),
  'Frontend index.html not found'
);

check(
  'Frontend vite.config.js exists',
  fs.existsSync(path.join(frontendPath, 'vite.config.js')),
  'Frontend vite.config.js not found'
);

// Check for build script
if (fs.existsSync(path.join(frontendPath, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(frontendPath, 'package.json'), 'utf8'));
  check(
    'Build script exists',
    pkg.scripts && pkg.scripts.build,
    'Frontend package.json should have a "build" script'
  );
}

// Environment Configuration Checks
console.log('\n⚙️  Configuration Checks:');
console.log('-'.repeat(60));

check(
  'Backend .env.example exists',
  fs.existsSync(path.join(backendPath, '.env.example')),
  'Create .env.example to document required environment variables',
  true
);

check(
  'Frontend .env.example exists',
  fs.existsSync(path.join(frontendPath, '.env.example')),
  'Create frontend .env.example to document required environment variables',
  true
);

// Documentation Checks
console.log('\n📚 Documentation Checks:');
console.log('-'.repeat(60));

check(
  'README.md exists',
  fs.existsSync(path.join(__dirname, '../README.md')),
  'README.md not found',
  true
);

check(
  'DEPLOYMENT_GUIDE.md exists',
  fs.existsSync(path.join(__dirname, '../DEPLOYMENT_GUIDE.md')),
  'DEPLOYMENT_GUIDE.md not found',
  true
);

// Security Checks
console.log('\n🔒 Security Checks:');
console.log('-'.repeat(60));

// Check if .env exists (shouldn't in repo)
check(
  '.env not in repository',
  !fs.existsSync(path.join(backendPath, '.env')) || 
  fs.readFileSync(path.join(backendPath, '.gitignore'), 'utf8').includes('.env'),
  '.env file should not be committed to repository'
);

// Check for node_modules in .gitignore
if (fs.existsSync(path.join(backendPath, '.gitignore'))) {
  const gitignore = fs.readFileSync(path.join(backendPath, '.gitignore'), 'utf8');
  check(
    'node_modules in .gitignore',
    gitignore.includes('node_modules'),
    'node_modules should be in .gitignore'
  );
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ⚠️  Warnings: ${warnings.length}`);
console.log(`   ❌ Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors (must fix before deployment):');
  errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
  console.log('\n❌ Deployment readiness check FAILED!');
  console.log('   Please fix the errors above before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✅ Deployment readiness check PASSED!');
  console.log('   Your application is ready for deployment.\n');
  
  if (warnings.length > 0) {
    console.log('   Note: There are some warnings you may want to address.\n');
  }
}
