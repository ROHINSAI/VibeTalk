# Vercel Deployment Fix Checklist

## ✅ Changes Made to Fix the 500 Error

1. **Updated server.js for serverless compatibility**

   - Removed `server.listen()` for production
   - Added database connection handling that doesn't crash on serverless
   - Updated CORS to accept production URLs

2. **Updated vercel.json**

   - Added NODE_ENV configuration
   - Proper routing setup

3. **Created api/index.js**
   - Vercel API route handler

## 🚀 Deploy to Vercel - Step by Step

### Step 1: Update Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://rohinsaib23:JXYAOEUW4rtZKmZV@cluster0.hyd9oyf.mongodb.net/VibeTalkDB?retryWrites=true&w=majority
PORT=8000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=dvxixppga
CLOUDINARY_API_KEY=278268952765558
CLOUDINARY_API_SECRET=gO0gCg7HzQQe9b9M_VI3inH8y5k
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.vercel.app
```

**⚠️ IMPORTANT:** Replace `FRONTEND_URL` with your actual frontend Vercel URL after deploying the frontend.

### Step 2: Deploy Backend

```bash
cd server
vercel --prod
```

Copy the backend URL (something like: `https://vibe-talk-server.vercel.app`)

### Step 3: Deploy Frontend

First, update the frontend environment variable:

In Vercel dashboard for your frontend project:

- Add: `VITE_BACKEND_URL=https://your-backend-url.vercel.app/api`

```bash
cd client
vercel --prod
```

### Step 4: Update Backend with Frontend URL

After getting your frontend URL:

1. Go to backend Vercel project → Settings → Environment Variables
2. Update `FRONTEND_URL` with your frontend URL
3. Redeploy: `vercel --prod` from the server directory

## 🔧 Alternative: Deploy via Git Push

1. **Commit your changes:**

```bash
git add .
git commit -m "Fix: Update server for Vercel deployment"
git push origin main
```

2. **Connect Vercel to GitHub:**
   - In Vercel dashboard, import your repository
   - Set root directory to `server`
   - Add all environment variables
   - Deploy!

## 🧪 Test Your Deployment

1. Test API health: `https://your-backend-url.vercel.app/api/status`

   - Should return: `{"status":"ok","timestamp":...}`

2. Check Vercel logs:
   - Go to your project → Deployments → Click latest deployment → Function Logs
   - Look for any errors

## 🐛 Common Issues & Fixes

### Issue: MongoDB Connection Timeout

**Fix:** In MongoDB Atlas:

1. Go to Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs)
3. Save changes

### Issue: CORS Error

**Fix:** Make sure `FRONTEND_URL` environment variable matches your frontend URL exactly (including https://)

### Issue: JWT/Cookie Issues

**Fix:** Update cookie settings for production in `server/controller/userController.js`:

```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: true, // true for production
  sameSite: "none", // "none" for cross-origin
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### Issue: Socket.IO Not Working

**Note:** Socket.IO has limitations on serverless. Consider:

- Using Vercel's WebSocket support (Pro plan)
- Or deploying Socket.IO server separately on Railway/Render

## 📝 Quick Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Redeploy
vercel --prod

# Remove deployment
vercel rm [deployment-url]
```

## 🎯 Deployment URLs Template

After successful deployment, save these:

- **Backend API:** https://_____.vercel.app
- **Frontend:** https://_____.vercel.app
- **MongoDB:** mongodb+srv://...

## ✨ Final Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed
3. ✅ Environment variables configured
4. ✅ CORS updated with frontend URL
5. ✅ MongoDB allows Vercel IPs
6. ✅ Test registration/login
7. ✅ Test messaging
8. ✅ Test image upload

---

**Need Help?** Check Vercel function logs for detailed error messages.
