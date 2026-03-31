# Deployment Cleanup Guide

This document outlines the cleanup steps needed before deploying the fitness app to production.

## 1. Remove Duplicate Files (PRIORITY)

The project currently has duplicate `.js` and `.jsx` files. **Keep only `.jsx` files.**

### Files to Delete:

#### Frontend Pages
```
app/frontend/src/pages/
  ❌ ActivityLogger.js
  ❌ Dashboard.js
  ❌ Meals.js
  ❌ Profile.js
  ❌ Social.js
```

#### Frontend Components
```
app/frontend/src/components/
  ❌ BottomNav.js
```

**Why?** These `.js` files are duplicates and not imported anywhere. They create confusion and waste disk space.

---

## 2. Configure Environment Variables

### Backend Setup
1. Navigate to `app/backend/`
2. Copy `.env.example` to `.env`
3. Update values:
   ```env
   MONGO_URL=mongodb://your_production_url
   SERVER_HOST=0.0.0.0
   SERVER_PORT=8000
   NODE_ENV=production
   ```

### Frontend Setup
1. Navigate to `app/frontend/`
2. Copy `.env.example` to `.env`
3. Update values:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   VITE_ENV=production
   ```

---

## 3. Clean Up Build Artifacts

The following files should NOT be in version control:
```
❌ app/frontend/index-CxEO1d9V.js
❌ app/frontend/index-DP1hXqsj.css
```

These are generated during the build process. They should:
- Be removed from git: `git rm --cached filename`
- Be generated fresh during CI/CD deployment
- Be placed in `dist/` folder (created during build)

---

## 4. Verify .gitignore

Ensure `.gitignore` includes:
```
.env
.env.local
node_modules/
dist/
__pycache__/
*.pyc
```

Run: `git status` to verify no sensitive files are tracked.

---

## 5. Backend Verification

```bash
cd app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Test server startup
python server.py
```

Expected output:
```
Uvicorn running on http://0.0.0.0:8000
```

---

## 6. Frontend Verification

```bash
cd app/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Check build output
ls -la dist/
```

Expected: `dist/` folder with `index.html`, `.js`, and `.css` files.

---

## 7. Pre-Deployment Security Checklist

- [ ] No `.env` files in git (only `.env.example`)
- [ ] No API keys or credentials in code
- [ ] No console.logs for debugging in production code
- [ ] All duplicate `.js` files deleted
- [ ] Production MongoDB URL configured
- [ ] Production API URL configured
- [ ] CORS properly configured in backend
- [ ] Build succeeds without errors
- [ ] No mixed `.js`/`.jsx` imports

---

## 8. Deployment Commands

### Using Docker (Recommended)

Create `Dockerfile` for backend:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY server.py .
CMD ["python", "server.py"]
```

### Manual Deployment

**Backend:**
```bash
python server.py
# OR with PM2:
pm2 start server.py --name fitness-backend
```

**Frontend:**
```bash
npm run build
# Deploy dist/ folder to static hosting (Vercel, Netlify, AWS S3, etc.)
```

---

## 9. Post-Deployment Verification

- [ ] Backend API responds at configured URL
- [ ] Frontend loads without 404 errors
- [ ] API calls from frontend succeed
- [ ] Database connection works
- [ ] Error logging enabled
- [ ] Monitoring alerts configured

---

## Support

For issues, check:
1. Environment variables are set correctly
2. MongoDB connection URL is accessible
3. Backend and frontend are on same network/domain
4. Firewall rules allow API traffic
