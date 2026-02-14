const crypto = require('crypto');
require('dotenv').config();

/**
 * Encryption Utility
 * Handles encryption and decryption of sensitive configuration data
 */

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive encryption key from password
 * @param {string} password - Encryption password
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @param {string} encryptionKey - Encryption key from environment
 * @returns {string} Encrypted text in format: salt:iv:encrypted:tag
 */
function encrypt(text, encryptionKey = process.env.ENCRYPTION_KEY) {
  if (!text) {
    throw new Error('Text to encrypt is required');
  }
  
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not found in environment variables');
  }

  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from encryption key
    const key = deriveKey(encryptionKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Return format: salt:iv:encrypted:tag (all in hex)
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text in format: salt:iv:encrypted:tag
 * @param {string} encryptionKey - Encryption key from environment
 * @returns {string} Decrypted text
 */
function decrypt(encryptedText, encryptionKey = process.env.ENCRYPTION_KEY) {
  if (!encryptedText) {
    throw new Error('Encrypted text is required');
  }
  
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not found in environment variables');
  }

  try {
    // Split the encrypted data
    const parts = encryptedText.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const tag = Buffer.from(parts[3], 'hex');
    
    // Derive key from encryption key
    const key = deriveKey(encryptionKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data. Invalid encryption key or corrupted data.');
  }
}

/**
 * Get decrypted Turso database URL
 * @returns {string} Decrypted database URL
 */
function getTursoURL() {
  const encryptedURL = process.env.TURSO_DATABASE_URL_ENCRYPTED;
  
  if (!encryptedURL) {
    // Fallback to plain URL if encrypted version not found
    if (process.env.TURSO_DATABASE_URL) {
      console.warn('⚠️  Using unencrypted TURSO_DATABASE_URL');
      return process.env.TURSO_DATABASE_URL;
    }
    throw new Error('TURSO_DATABASE_URL_ENCRYPTED not found in environment');
  }
  
  try {
    return decrypt(encryptedURL);
  } catch (error) {
    console.error('Failed to decrypt Turso URL:', error.message);
    throw error;
  }
}

/**
 * Get decrypted Turso auth token
 * @returns {string} Decrypted auth token
 */
function getTursoToken() {
  const encryptedToken = process.env.TURSO_AUTH_TOKEN_ENCRYPTED;
  
  if (!encryptedToken) {
    // Fallback to plain token if encrypted version not found
    if (process.env.TURSO_AUTH_TOKEN) {
      console.warn('⚠️  Using unencrypted TURSO_AUTH_TOKEN');
      return process.env.TURSO_AUTH_TOKEN;
    }
    throw new Error('TURSO_AUTH_TOKEN_ENCRYPTED not found in environment');
  }
  
  try {
    return decrypt(encryptedToken);
  } catch (error) {
    console.error('Failed to decrypt Turso token:', error.message);
    throw error;
  }
}

/**
 * Validate encryption key strength
 * @param {string} key - Encryption key to validate
 * @returns {boolean} True if key is strong enough
 */
function validateEncryptionKey(key) {
  if (!key) return false;
  if (key.length < 32) return false;
  if (key === 'change-this-to-a-random-secret-key-in-production') return false;
  return true;
}

/**
 * Generate a new encryption key
 * @returns {string} Random encryption key (hex)
 */
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  getTursoURL,
  getTursoToken,
  validateEncryptionKey,
  generateEncryptionKey
};
