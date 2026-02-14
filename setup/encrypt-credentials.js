#!/usr/bin/env node

/**
 * Encryption Setup Script
 * Encrypts your Turso credentials for secure storage in .env file
 */

const { encrypt, generateEncryptionKey } = require('../config/encryption');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     🔐 Portfolio CMS - Credential Encryption Setup    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('This script will encrypt your Turso credentials for secure storage.\n');

  try {
    // Get Turso Database URL
    const tursoURL = await question('Enter your Turso Database URL: ');
    if (!tursoURL.trim()) {
      throw new Error('Database URL is required');
    }

    // Get Turso Auth Token
    const tursoToken = await question('Enter your Turso Auth Token: ');
    if (!tursoToken.trim()) {
      throw new Error('Auth token is required');
    }

    // Generate or get encryption key
    console.log('\n📝 Generating encryption key...');
    const encryptionKey = generateEncryptionKey();
    console.log('✅ Encryption key generated\n');

    // Encrypt credentials
    console.log('🔒 Encrypting credentials...');
    const encryptedURL = encrypt(tursoURL.trim(), encryptionKey);
    const encryptedToken = encrypt(tursoToken.trim(), encryptionKey);
    console.log('✅ Credentials encrypted\n');

    // Get admin credentials
    const adminUsername = await question('Enter admin username (default: admin): ') || 'admin';
    const adminPassword = await question('Enter admin password (default: admin123): ') || 'admin123';

    // Generate session secret
    const sessionSecret = generateEncryptionKey();

    // Create .env content
    const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (IMPORTANT: Keep this secure!)
SESSION_SECRET=${sessionSecret}

# Encryption Key (CRITICAL: Never share or commit this!)
ENCRYPTION_KEY=${encryptionKey}

# Encrypted Turso Database Configuration
TURSO_DATABASE_URL_ENCRYPTED=${encryptedURL}
TURSO_AUTH_TOKEN_ENCRYPTED=${encryptedToken}

# Admin Account
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}

# IMPORTANT NOTES:
# 1. Never commit this .env file to version control
# 2. Keep ENCRYPTION_KEY secure - if lost, you cannot decrypt credentials
# 3. In production, use a strong ADMIN_PASSWORD
# 4. Backup this file in a secure location
`;

    // Write to .env file
    const envPath = path.join(__dirname, '../.env');
    fs.writeFileSync(envPath, envContent);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ Setup Complete!                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📄 .env file created with encrypted credentials\n');

    console.log('🔐 Security Information:');
    console.log('   • Your credentials are now encrypted');
    console.log('   • The .env file contains your encryption key');
    console.log('   • Never commit .env to version control');
    console.log('   • Backup .env in a secure location\n');

    console.log('📝 Next Steps:');
    console.log('   1. Run: npm install');
    console.log('   2. Run: npm run setup (to initialize database)');
    console.log('   3. Run: npm start (to start the server)');
    console.log('   4. Visit: http://localhost:3000\n');

    console.log('🎉 You\'re ready to go!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
