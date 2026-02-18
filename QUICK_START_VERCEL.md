# Quick Start Guide - Vercel Deployment

## 5-Minute Deployment Guide

### Step 1: Prepare Environment Variables (2 min)
1. Copy `.env.example` to `.env`
2. Fill in at minimum:
   - `MONGODB_URI` - Get from [MongoDB Atlas](https://mongodb.com/atlas)
   - `JWT_SECRET` - Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 2: Push to GitHub (1 min)
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Step 3: Deploy to Vercel (2 min)
1. Visit [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables from your `.env` file
5. Click "Deploy"

**That's it!** Your app will be live in ~2 minutes. 🎉

---

## What Gets Deployed?

✅ **Frontend** - React app with all UI components
✅ **API Routes** - Serverless functions in `/api` folder
✅ **Database** - MongoDB Atlas (cloud database)

⚠️ **Separate Deployment Needed:**
- **ML Model** (`ml-model/`) - Deploy to Railway or Render
- **WebSocket Server** (if needed) - For real-time Socket.io

---

## After Deployment

Your app will be available at: `https://your-project-name.vercel.app`

### Test Your API:
```bash
curl https://your-project-name.vercel.app/api/health
```

### View Logs:
- Go to Vercel Dashboard → Your Project → Deployments → View Function Logs

---

## Common Issues & Fixes

**Issue**: Build fails
**Fix**: Check build logs, ensure all dependencies are in `package.json`

**Issue**: API returns 500
**Fix**: Check environment variables are set in Vercel dashboard

**Issue**: Database connection fails
**Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

---

## Need Help?
- Full guide: See `VERCEL_DEPLOYMENT.md`
- Vercel Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
