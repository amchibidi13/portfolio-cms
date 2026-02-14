# 🔐 Encryption & Security Guide

## Overview

Your Turso database credentials are now **encrypted** in the `.env` file for enhanced security. This guide explains how the encryption works and how to use it.

## 🎯 What's Encrypted

Your sensitive credentials are encrypted using **AES-256-GCM** (military-grade encryption):

- ✅ **Turso Database URL** → `TURSO_DATABASE_URL_ENCRYPTED`
- ✅ **Turso Auth Token** → `TURSO_AUTH_TOKEN_ENCRYPTED`

## 🔑 How It Works

### Encryption Process

```
Your Credential (Plain Text)
         ↓
AES-256-GCM Encryption with ENCRYPTION_KEY
         ↓
Encrypted String (Safe to store)
         ↓
Stored in .env file
```

### Decryption Process (Automatic)

```
Application starts
         ↓
Reads ENCRYPTION_KEY from .env
         ↓
Decrypts TURSO_DATABASE_URL_ENCRYPTED
         ↓
Decrypts TURSO_AUTH_TOKEN_ENCRYPTED
         ↓
Connects to database
```

## 📁 Key Files

### 1. `.env` - Your Configuration
Contains encrypted credentials and encryption key.

**⚠️ CRITICAL: Never commit this file to Git!**

### 2. `config/encryption.js` - Encryption Module
Handles encryption/decryption logic:
- `encrypt(text)` - Encrypts data
- `decrypt(text)` - Decrypts data
- `getTursoURL()` - Returns decrypted database URL
- `getTursoToken()` - Returns decrypted auth token

### 3. `config/database.js` - Database Connection
Automatically decrypts credentials when connecting to database.

### 4. `setup/encrypt-credentials.js` - Setup Script
Interactive script to encrypt new credentials.

## 🚀 Quick Start

### Your .env file is ready!

Just run:

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
npm run setup

# 3. Start the server
npm start
```

The decryption happens automatically! 🎉

## 🔄 Re-encrypting Credentials

If you need to change your Turso credentials:

```bash
# Run the interactive encryption script
npm run encrypt
```

This will:
1. Ask for your new Turso URL
2. Ask for your new Turso token
3. Generate a new encryption key
4. Encrypt your credentials
5. Update your .env file

## 🔐 Security Features

### 1. AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard)
- **Key Size**: 256 bits (military-grade)
- **Authentication**: GCM provides authentication
- **Salt**: Random 64-byte salt for key derivation
- **IV**: Random 16-byte initialization vector

### 2. Key Derivation
Uses PBKDF2 with:
- 100,000 iterations
- SHA-256 hashing
- Unique salt per encryption

### 3. Format
Encrypted data format:
```
salt:iv:encrypted_data:auth_tag
```

Each component is hex-encoded.

## 🛡️ Security Best Practices

### ✅ DO:

1. **Keep ENCRYPTION_KEY secure**
   - Store in password manager
   - Backup securely
   - Never share publicly

2. **Keep .env file secure**
   - Never commit to Git
   - Restrict file permissions: `chmod 600 .env`
   - Backup in secure location

3. **Use strong admin password**
   - Change from default "admin123"
   - Use 16+ characters
   - Mix letters, numbers, symbols

4. **Rotate credentials regularly**
   - Change passwords every 90 days
   - Generate new session secrets
   - Re-encrypt with new keys

### ❌ DON'T:

1. **Never commit .env to Git**
   - Already in .gitignore
   - Double-check before pushing

2. **Never share ENCRYPTION_KEY**
   - Treat like a password
   - Don't email or message

3. **Never use default passwords in production**
   - Change admin123 immediately
   - Use strong unique passwords

4. **Never lose your encryption key**
   - If lost, cannot decrypt credentials
   - Must re-encrypt everything

## 🔍 Verification

### Test Decryption

You can verify your encryption is working:

```bash
node -e "
const { getTursoURL, getTursoToken } = require('./config/encryption');
require('dotenv').config();

console.log('Testing decryption...');
try {
  const url = getTursoURL();
  const token = getTursoToken();
  console.log('✅ URL decrypted:', url.substring(0, 30) + '...');
  console.log('✅ Token decrypted:', token.substring(0, 30) + '...');
  console.log('✅ Decryption successful!');
} catch (error) {
  console.error('❌ Decryption failed:', error.message);
}
"
```

## 🚨 Troubleshooting

### "Failed to decrypt data"

**Cause**: Wrong ENCRYPTION_KEY or corrupted encrypted data

**Solution**:
```bash
# Re-encrypt your credentials
npm run encrypt
```

### "ENCRYPTION_KEY not found"

**Cause**: Missing ENCRYPTION_KEY in .env

**Solution**: Add ENCRYPTION_KEY to your .env file

### "Weak encryption key detected"

**Cause**: ENCRYPTION_KEY is too short or default value

**Solution**: Generate new key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Environment Variables Reference

```env
# Required for encryption
ENCRYPTION_KEY=<64-char-hex-string>

# Encrypted credentials
TURSO_DATABASE_URL_ENCRYPTED=<encrypted-url>
TURSO_AUTH_TOKEN_ENCRYPTED=<encrypted-token>

# Optional: Plain credentials (fallback)
# Only use during setup, then delete
TURSO_DATABASE_URL=<plain-url>
TURSO_AUTH_TOKEN=<plain-token>
```

## 🌐 Deployment

### For Production Hosting (Render, Railway, etc.):

**Option 1: Use Encrypted (Recommended)**
```env
NODE_ENV=production
ENCRYPTION_KEY=your-encryption-key
TURSO_DATABASE_URL_ENCRYPTED=your-encrypted-url
TURSO_AUTH_TOKEN_ENCRYPTED=your-encrypted-token
ADMIN_PASSWORD=strong-password-here
SESSION_SECRET=random-session-secret
```

**Option 2: Use Plain (Less Secure)**
```env
NODE_ENV=production
TURSO_DATABASE_URL=your-plain-url
TURSO_AUTH_TOKEN=your-plain-token
ADMIN_PASSWORD=strong-password-here
SESSION_SECRET=random-session-secret
```

**Note**: The app supports both encrypted and plain credentials. It tries encrypted first, then falls back to plain.

## 🎓 How Encryption Protects You

### Without Encryption:
```env
# ❌ Visible to anyone who sees the file
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### With Encryption:
```env
# ✅ Meaningless without ENCRYPTION_KEY
TURSO_AUTH_TOKEN_ENCRYPTED=abc123def456...
ENCRYPTION_KEY=xyz789uvw012...
```

Even if someone sees your encrypted token, they cannot use it without your encryption key.

## 📝 Backup Checklist

Before deploying, backup these securely:

- [ ] Full .env file
- [ ] ENCRYPTION_KEY separately
- [ ] Admin username and password
- [ ] Session secret
- [ ] Turso dashboard login credentials

Store in:
- Password manager (1Password, Bitwarden)
- Encrypted notes app
- Secure cloud storage (with encryption)

## 🔄 Migration from Plain to Encrypted

If you started with plain credentials:

1. **Run encryption script**:
   ```bash
   npm run encrypt
   ```

2. **Backup old .env**:
   ```bash
   cp .env .env.backup
   ```

3. **Test the new .env**:
   ```bash
   npm start
   ```

4. **Delete backup after confirming**:
   ```bash
   rm .env.backup
   ```

## 💡 Pro Tips

1. **Generate Strong Keys**:
   ```bash
   # Encryption key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Session secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Check Encryption Strength**:
   ```bash
   # Keys should be 64 characters (hex)
   echo $ENCRYPTION_KEY | wc -c
   ```

3. **Secure .env Permissions**:
   ```bash
   chmod 600 .env
   ```

4. **Audit Security**:
   ```bash
   # Check for accidentally committed secrets
   git log -p | grep -i "turso\|token\|secret"
   ```

## 🎉 Summary

Your credentials are now:
- ✅ Encrypted with AES-256-GCM
- ✅ Protected by a strong encryption key
- ✅ Safe from casual viewing
- ✅ Ready for production use

**Your security setup is complete!** 🔐

---

**Need Help?**
- Check the main README.md
- Review this guide
- Test decryption with the verification script

**Remember**: Security is a process, not a one-time setup. Keep your credentials updated and secure!
