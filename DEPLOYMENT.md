# Deployment Guide for VibeTalk on Vercel

This guide will help you deploy your VibeTalk chat application on Vercel.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at vercel.com)
- MongoDB Atlas account (for production database)
- Cloudinary account (for image hosting)

## Deployment Steps

### 1. Prepare Your Backend (Server)

The backend will be deployed separately on Vercel as a serverless function.

**Important Files:**

- `server/vercel.json` - Already created ✓
- Make sure all environment variables are documented

### 2. Deploy Backend to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to server directory
cd server

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure as follows:
   - **Root Directory:** `server`
   - **Framework Preset:** Other
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
5. Add Environment Variables (see section below)
6. Click **"Deploy"**

**Backend Environment Variables to Add:**

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=8000
NODE_ENV=production
```

### 3. Deploy Frontend to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Navigate to client directory
cd ../client

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Create another new project in Vercel
2. Import the same GitHub repository
3. Configure as follows:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   VITE_BACKEND_URL=https://your-backend-url.vercel.app/api
   ```
5. Click **"Deploy"**

### 4. Update CORS Settings

After deployment, update your backend CORS settings:

**In `server/server.js`:**

```javascript
app.use(
  cors({
    origin: "https://your-frontend-url.vercel.app", // Replace with your frontend URL
    credentials: true,
  })
);

// Also update Socket.IO CORS
export const io = new Server(server, {
  cors: {
    origin: "https://your-frontend-url.vercel.app", // Replace with your frontend URL
    credentials: true,
  },
});
```

### 5. Redeploy Backend with Updated CORS

After updating CORS settings, commit and push your changes, or redeploy via CLI:

```bash
cd server
vercel --prod
```

## Important Notes

### MongoDB Connection

- Use MongoDB Atlas for production
- Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)
- Get connection string from MongoDB Atlas dashboard

### Environment Variables

Never commit `.env` files. All environment variables must be added in Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables

### Testing Deployment

1. Visit your frontend URL: `https://your-app.vercel.app`
2. Test user registration and login
3. Test real-time messaging
4. Test image uploads
5. Check browser console for any errors

## Troubleshooting

### Socket.IO Not Working

- Make sure your backend URL is correct in frontend env
- Check CORS settings allow your frontend domain
- Vercel functions have 10s timeout - Socket.IO may have limitations

### Images Not Uploading

- Verify Cloudinary credentials are correct
- Check Cloudinary upload folder permissions
- Ensure base64 images aren't too large (Vercel has 4.5MB limit)

### Database Connection Errors

- Verify MongoDB URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

### Cookie/Authentication Issues

- Set `sameSite: 'none'` and `secure: true` for production cookies
- Ensure CORS credentials are enabled
- Check that frontend and backend are on HTTPS

## Alternative: Deploy Both on Same Project

If you want a monorepo deployment:

1. Keep the root `vercel.json` file
2. Deploy from the root directory
3. Vercel will build both frontend and backend
4. Update environment variables accordingly

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API is accessible
- [ ] User registration works
- [ ] User login works
- [ ] Real-time messaging works
- [ ] Image uploads work
- [ ] Online/offline status updates
- [ ] Mobile responsive design works
- [ ] No console errors

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update CORS settings with new domain

## Useful Commands

```bash
# Check deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]

# View environment variables
vercel env ls
```

## Support

If you encounter issues:

- Check Vercel deployment logs
- Review browser console errors
- Check MongoDB Atlas logs
- Verify all environment variables are set correctly

Good luck with your deployment! 🚀
