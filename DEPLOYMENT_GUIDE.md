# Portfolio CMS - Deployment Guide

## 🎯 You Are Here: Application Files

This package contains your complete Portfolio CMS application, ready for deployment.

## ✅ Prerequisites Checklist

Before deploying:
- [x] Database initialized (using database-setup package)
- [ ] GitHub repository created
- [ ] Hosting account ready (Render/Railway)
- [ ] Environment variables copied from .env

## 🚀 Quick Deploy to Render

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Portfolio CMS - Ready to deploy"
git remote add origin https://github.com/YOUR_USERNAME/portfolio-cms.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Add environment variables from .env
5. Click "Create Web Service"

### Step 3: Access Your Site
- Public: `https://your-app.onrender.com`
- Admin: `https://your-app.onrender.com/admin`
- Login: admin / (your password)

## 📋 Environment Variables to Set

Copy from your `.env` file:

```env
NODE_ENV=production
ENCRYPTION_KEY=7f78ba15ab9488b5a2dcd5420cabe675dd5f4b037dff5e45670fe9a75ee72fb6
SESSION_SECRET=6fea2a0b0cba7d84462283fcc25fba4f70fb434edf390cfe8d70b0eeb75549dc
TURSO_DATABASE_URL_ENCRYPTED=[your encrypted url from .env]
TURSO_AUTH_TOKEN_ENCRYPTED=[your encrypted token from .env]
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongPassword123!
```

⚠️ Change ADMIN_PASSWORD to something strong!

## 📖 Full Documentation

See the main README.md files for complete documentation.

