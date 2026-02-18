# Deploying DAM AI Guardian to Vercel

This guide will help you deploy the DAM AI Guardian application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works great!)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. Git repository with your project code
4. MongoDB Atlas account (for database)
5. Environment variables ready

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the root directory

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   Go to Project Settings → Environment Variables and add:

   ```
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Twilio (SMS)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # WhatsApp Business API
   WHATSAPP_INSTANCE_ID=your_whatsapp_instance_id
   WHATSAPP_API_TOKEN=your_whatsapp_api_token
   
   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   
   # Weather API (optional)
   OPENWEATHER_API_KEY=your_openweather_api_key
   
   # Node Environment
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # ... add all other variables
   ```

## Database Setup (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (use `0.0.0.0/0` for Vercel)
4. Get your connection string
5. Add to Vercel environment variables as `MONGODB_URI`

## Important Notes

### API Routes
- All API endpoints are now serverless functions in the `/api` directory
- They are automatically deployed with your app
- Example endpoints:
  - `https://your-app.vercel.app/api/health`
  - `https://your-app.vercel.app/api/sensors`
  - `https://your-app.vercel.app/api/weather`
  - `https://your-app.vercel.app/api/alerts`

### ML Model Deployment
The Python ML model (`ml-model/`) needs separate deployment:

**Option 1: Deploy to Heroku, Railway, or Render**
1. Create a separate repository for the ML model
2. Deploy to a Python-friendly platform
3. Update your frontend to point to the ML API URL

**Option 2: Use Vercel Python Runtime** (experimental)
- Create API functions in Python
- Reference: [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)

### Real-time Features (Socket.io)
- Socket.io requires a persistent connection
- For real-time features, consider:
  1. Using Vercel's Edge Functions
  2. Deploying WebSocket server separately (Railway, Render)
  3. Using Vercel's [Serverless Functions with Streaming](https://vercel.com/docs/functions/streaming)

### File Storage
- Vercel has a read-only filesystem
- For file uploads, use:
  - Amazon S3
  - Cloudinary
  - Vercel Blob Storage

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

## Monitoring & Analytics

- View deployment logs in Vercel Dashboard
- Enable Vercel Analytics for traffic insights
- Set up error tracking (Sentry, LogRocket)

## Continuous Deployment

- Vercel automatically deploys on every push to main branch
- Pull requests get preview deployments
- Configure deployment branches in Project Settings

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### API Errors
- Check Function Logs in Vercel Dashboard
- Verify MongoDB connection string
- Ensure CORS is properly configured

### Cold Start Issues
- Serverless functions may have cold starts
- Consider upgrading to Vercel Pro for better performance
- Optimize function size and dependencies

## Cost Considerations

### Free Tier Includes:
- 100GB bandwidth
- 6,000 execution minutes
- Unlimited API requests
- Automatic SSL

### Upgrade if you need:
- More bandwidth
- Faster build times
- Priority support
- Team collaboration features

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connectivity
- [ ] Test authentication flow
- [ ] Check real-time features
- [ ] Test on mobile devices
- [ ] Verify environment variables
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain
- [ ] Test SMS/WhatsApp notifications
- [ ] Backup database regularly

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [MongoDB Atlas Support](https://www.mongodb.com/support)

## Next Steps

1. Monitor your application performance
2. Set up error tracking
3. Configure CDN for static assets
4. Implement database backups
5. Set up staging environment
6. Document API endpoints

---

**Happy Deploying! 🚀**

For questions or issues, refer to the [Vercel Documentation](https://vercel.com/docs) or create an issue in your repository.
