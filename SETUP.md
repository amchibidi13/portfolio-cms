# Portfolio CMS - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
cd portfolio-cms
npm install
```

### Step 2: Setup Turso Database (2 min)

#### Option A: Using Turso CLI (Recommended)
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create portfolio-cms

# Get database URL
turso db show portfolio-cms --url
# Copy this URL

# Create auth token
turso db tokens create portfolio-cms
# Copy this token
```

#### Option B: Using Turso Web Dashboard
1. Go to https://turso.tech/
2. Sign up/Login
3. Create a new database named "portfolio-cms"
4. Copy the database URL
5. Go to "Auth Tokens" and create a new token
6. Copy the token

### Step 3: Configure Environment (1 min)

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Turso credentials:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=my-super-secret-key-change-this-in-production
TURSO_DATABASE_URL=libsql://portfolio-cms-[your-username].turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 4: Initialize Database (30 sec)
```bash
npm run setup
```

You should see:
```
✅ Schema created successfully
✅ Seed data inserted successfully
✅ Admin user created successfully
🎉 Database initialization completed successfully!
```

### Step 5: Start the Server (10 sec)
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║     🚀 Portfolio CMS Server Running                        ║
║     📍 Local:            http://localhost:3000             ║
║     🔐 Admin Panel:      http://localhost:3000/admin       ║
╚════════════════════════════════════════════════════════════╝
```

### Step 6: Login to Admin Panel (30 sec)

1. Open http://localhost:3000/admin
2. Login with:
   - Username: `admin`
   - Password: `admin123` (or what you set in .env)

## ✅ Verification Checklist

- [ ] Node.js installed
- [ ] npm install completed without errors
- [ ] Turso database created
- [ ] .env file created with correct values
- [ ] npm run setup completed successfully
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login to http://localhost:3000/admin
- [ ] Dashboard loads correctly

## 🎯 First Steps After Setup

### 1. Change Admin Password
1. Go to Admin Dashboard
2. Navigate to Configuration
3. Update your admin credentials

### 2. Customize Site Appearance
1. Go to Configuration
2. Change colors:
   - `primary_color`: Your brand color
   - `secondary_color`: Secondary accent
   - `accent_color`: Highlights
3. Update fonts:
   - `font_primary`: Body font
   - `font_heading`: Heading font

### 3. Update Content
1. Go to Configuration
2. Find "Text Content" section
3. Update all text labels with your content:
   - `site_title`: Your name/brand
   - `site_description`: Your tagline
   - `home_hero_title`: Your headline
   - etc.

### 4. Add Your Projects
1. Open your database (via Turso CLI or dashboard)
2. Update the `projects` table with your work
3. Or add database management to admin panel (future enhancement)

### 5. Customize Pages
1. Go to Pages management
2. Edit existing pages
3. Add new pages as needed

## 🔧 Common Issues & Solutions

### Issue: "TURSO_DATABASE_URL is not defined"
**Solution**: 
- Check that `.env` file exists in project root
- Verify it contains `TURSO_DATABASE_URL=...`
- Restart the server after editing .env

### Issue: "Database query error"
**Solution**:
- Verify your Turso auth token is correct
- Check that the database URL is correct
- Run `turso db tokens create portfolio-cms` to create a new token

### Issue: "Cannot login to admin"
**Solution**:
- Run `npm run setup` again to recreate the admin user
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in .env
- Check for typos in credentials

### Issue: "Port 3000 already in use"
**Solution**:
- Change `PORT` in .env to another port (e.g., 3001)
- Or stop the process using port 3000

### Issue: "Module not found"
**Solution**:
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## 📱 Development vs Production

### Development Mode
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Production Mode
```env
NODE_ENV=production
SESSION_SECRET=generate-a-long-random-string-here
```
```bash
npm start
```

## 🌐 Deploying to the Internet

### Quick Deploy Options

#### Option 1: Render.com
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Add environment variables
5. Deploy!

#### Option 2: Railway.app
1. Push code to GitHub
2. Create new project on Railway
3. Connect repository
4. Add environment variables
5. Deploy automatically

#### Option 3: Vercel (requires adapter)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts

## 📞 Getting Help

1. **Check the main README.md** for detailed documentation
2. **Review server logs** for error messages
3. **Check Turso dashboard** for database issues
4. **Verify .env file** has all required variables

## 🎉 Success!

You now have a fully functional, database-driven portfolio website!

**Next Steps:**
- Customize your content
- Add your projects
- Personalize the design
- Deploy to production

**Resources:**
- Main Documentation: README.md
- Turso Docs: https://docs.turso.tech/
- Express Docs: https://expressjs.com/

Happy building! 🚀
