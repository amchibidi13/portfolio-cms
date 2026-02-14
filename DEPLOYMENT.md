# Deployment Guide - Portfolio CMS

## 🚀 Deploy to Render.com (Recommended - FREE)

### Prerequisites
- GitHub account
- Render.com account (free)
- Turso database (free tier at turso.tech)

### Step-by-Step Deployment

#### 1. Prepare Your Code

First, add a `render.yaml` file for easy deployment:

Create `render.yaml` in your project root:
```yaml
services:
  - type: web
    name: portfolio-cms
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        generateValue: true
      - key: TURSO_DATABASE_URL
        sync: false
      - key: TURSO_AUTH_TOKEN
        sync: false
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_PASSWORD
        sync: false
```

#### 2. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/portfolio-cms.git
git branch -M main
git push -u origin main
```

#### 3. Setup Turso Database

```bash
# Create database
turso db create portfolio-cms

# Get database URL
turso db show portfolio-cms --url

# Create auth token
turso db tokens create portfolio-cms

# Save these values - you'll need them!
```

#### 4. Deploy on Render

1. **Go to [render.com](https://render.com) and sign up**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**
   - Click "Connect GitHub"
   - Select your repository

4. **Configure the service:**
   - Name: `portfolio-cms` (or your choice)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Add Environment Variables:**

   Click "Advanced" and add:
   ```
   NODE_ENV = production
   SESSION_SECRET = [generate a random 32-character string]
   TURSO_DATABASE_URL = [your Turso database URL]
   TURSO_AUTH_TOKEN = [your Turso auth token]
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = [your secure password]
   ```

   **Generate SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)

8. **Initialize Database:**
   
   Once deployed, you need to run the setup script once:
   
   Option A - Using Render Shell:
   - Go to your service dashboard
   - Click "Shell" tab
   - Run: `npm run setup`

   Option B - Add to package.json:
   Update your `package.json` to run setup on first deploy:
   ```json
   {
     "scripts": {
       "start": "node setup/init-db.js && node server.js",
       "dev": "nodemon server.js",
       "setup": "node setup/init-db.js"
     }
   }
   ```

9. **Access Your Site:**
   - Your site will be at: `https://portfolio-cms.onrender.com`
   - Admin panel: `https://portfolio-cms.onrender.com/admin`

#### 5. Setup Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as shown

### Important Notes

⚠️ **Free Tier Limitations:**
- Apps spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free compute time

💡 **Tips:**
- Use a cron job or uptime monitor to keep it awake
- Consider upgrading to paid tier ($7/month) for always-on service

---

## 🚂 Deploy to Railway.app (Alternative)

### Quick Deploy

1. **Go to [railway.app](https://railway.app)**

2. **Click "Start a New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Connect your repository**

5. **Add Environment Variables:**
   - Settings → Variables
   - Add all variables from `.env`

6. **Deploy automatically**

7. **Run database setup:**
   - Open the service
   - Click "Deploy Logs"
   - Ensure `npm run setup` runs successfully

### Custom Domain
- Settings → Domains
- Add your custom domain
- Update DNS records

---

## ⚡ Deploy to Vercel (Advanced)

Vercel requires converting to serverless functions. Here's a quick adapter:

### 1. Install Vercel adapter
```bash
npm install -D @vercel/node
```

### 2. Create `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. Deploy
```bash
npm i -g vercel
vercel
```

**Note:** This requires modifying the app structure for serverless compatibility.

---

## 🐙 Deploy to Heroku

### Prerequisites
```bash
npm install -g heroku
heroku login
```

### Deploy Steps

1. **Create Heroku app:**
```bash
heroku create your-portfolio-cms
```

2. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set TURSO_DATABASE_URL=your-database-url
heroku config:set TURSO_AUTH_TOKEN=your-auth-token
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your-password
```

3. **Deploy:**
```bash
git push heroku main
```

4. **Initialize database:**
```bash
heroku run npm run setup
```

5. **Open app:**
```bash
heroku open
```

---

## 🔒 Security Checklist for Production

Before deploying, ensure:

- [ ] Strong `ADMIN_PASSWORD` set
- [ ] Random `SESSION_SECRET` generated
- [ ] `NODE_ENV=production` set
- [ ] Turso auth token is secure
- [ ] No sensitive data in git history
- [ ] `.env` is in `.gitignore`
- [ ] HTTPS is enabled (automatic on most platforms)

---

## 📊 Post-Deployment

### 1. Test Everything
- [ ] Public site loads
- [ ] Admin login works
- [ ] Can create pages
- [ ] Can edit content
- [ ] Forms work
- [ ] Mobile responsive

### 2. Change Default Password
- Login to admin panel
- Navigate to Configuration
- Update admin credentials

### 3. Add Your Content
- Update site title and colors
- Add your projects
- Write about page
- Customize text content

### 4. Monitor
- Check deployment logs
- Monitor uptime
- Test performance

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Verify `TURSO_DATABASE_URL` is correct
- Check `TURSO_AUTH_TOKEN` is valid
- Ensure database exists in Turso

### "Application Error"
- Check deployment logs
- Verify all environment variables are set
- Ensure `npm run setup` completed successfully

### "Slow first load"
- Normal on free tiers (spin-down after inactivity)
- Consider paid tier or uptime monitoring

### "Cannot login to admin"
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Try running `npm run setup` again
- Check server logs for errors

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid |
|----------|-----------|------|
| **Render** | 750 hrs/month | $7/month |
| **Railway** | $5 credit/month | Pay as you go |
| **Vercel** | Hobby (free) | $20/month |
| **Heroku** | Eco ($5/month) | $25/month |

**Recommendation:** Start with Render.com free tier, upgrade if needed.

---

## 🎉 Success!

Your portfolio CMS is now live and accessible to the world! 🌍

**Next Steps:**
1. Share your URL with friends
2. Customize your content
3. Add your projects
4. Connect custom domain
5. Monitor analytics

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Turso Documentation](https://docs.turso.tech)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

**Happy Deploying! 🚀**
