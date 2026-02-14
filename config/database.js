const { createClient } = require('@libsql/client');
const { getTursoURL, getTursoToken, validateEncryptionKey } = require('./encryption');
require('dotenv').config();

let dbClient = null;

/**
 * Initialize database connection with encrypted credentials
 * @param {string} url - Turso database URL (optional, will decrypt from env)
 * @param {string} authToken - Turso auth token (optional, will decrypt from env)
 * @returns {Object} Database client
 */
function initializeDatabase(url = null, authToken = null) {
  try {
    // Validate encryption key if using encrypted credentials
    if (process.env.TURSO_DATABASE_URL_ENCRYPTED || process.env.TURSO_AUTH_TOKEN_ENCRYPTED) {
      if (!validateEncryptionKey(process.env.ENCRYPTION_KEY)) {
        console.warn('⚠️  WARNING: Weak or missing ENCRYPTION_KEY detected!');
        console.warn('   Generate a strong key with: node setup/encrypt-credentials.js');
      }
    }

    // Get credentials (decrypt if encrypted, or use provided/plain values)
    let dbUrl = url;
    let token = authToken;

    if (!dbUrl) {
      try {
        dbUrl = getTursoURL();
        console.log('🔓 Decrypted Turso database URL');
      } catch (error) {
        // Fallback to plain URL if decryption fails
        dbUrl = process.env.TURSO_DATABASE_URL;
        if (!dbUrl) {
          throw new Error('TURSO_DATABASE_URL not found. Run: node setup/encrypt-credentials.js');
        }
      }
    }

    if (!token) {
      try {
        token = getTursoToken();
        console.log('🔓 Decrypted Turso auth token');
      } catch (error) {
        // Fallback to plain token if decryption fails
        token = process.env.TURSO_AUTH_TOKEN;
      }
    }

    if (!dbUrl) {
      throw new Error('TURSO_DATABASE_URL is not defined');
    }

    dbClient = createClient({
      url: dbUrl,
      authToken: token || undefined
    });
    
    console.log('✅ Database connection initialized');
    return dbClient;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Get database client instance
 * @returns {Object} Database client
 */
function getDatabase() {
  if (!dbClient) {
    return initializeDatabase();
  }
  return dbClient;
}

/**
 * Execute a database query with error handling
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
async function executeQuery(sql, params = []) {
  try {
    const db = getDatabase();
    const result = await db.execute({ sql, args: params });
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Array} queries - Array of {sql, params} objects
 * @returns {Array} Results array
 */
async function executeTransaction(queries) {
  const db = getDatabase();
  const results = [];
  
  try {
    await db.execute('BEGIN TRANSACTION');
    
    for (const query of queries) {
      const result = await db.execute({
        sql: query.sql,
        args: query.params || []
      });
      results.push(result);
    }
    
    await db.execute('COMMIT');
    return results;
  } catch (error) {
    await db.execute('ROLLBACK');
    console.error('Transaction error:', error.message);
    throw error;
  }
}

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parse fails
 * @returns {*} Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback = {}) {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error.message);
    return fallback;
  }
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (dbClient) {
    dbClient.close();
    dbClient = null;
    console.log('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  executeQuery,
  executeTransaction,
  safeJsonParse,
  closeDatabase
};
