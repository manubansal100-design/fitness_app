# Deployment Testing Guide

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB running locally (or accessible connection)
- Git

---

## Step 1: Backend Setup & Testing

### 1.1 Install Dependencies
```bash
cd app/backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Verify Environment Configuration
```bash
# Check .env file exists with production values
cat .env

# Expected output:
# MONGO_URL=mongodb://localhost:27017/fitness_app
# SERVER_PORT=8000
# SERVER_HOST=0.0.0.0
# NODE_ENV=production
# DEBUG=false
# CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 1.3 Start Backend Server
```bash
python server.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 1.4 Test Backend API
Open new terminal and run:
```bash
# Test root endpoint
curl http://localhost:8000/api/

# Expected response:
# {"message":"Discipline & Flow API"}

# Test creating a user
curl -X POST http://localhost:8000/api/users \n  -H "Content-Type: application/json" \n  -d '{"name":"Test User"}'

# Expected response:
# {"id":"<uuid>","name":"Test User","discipline_score":100,"total_steps":0,"badges":[],"created_at":"<timestamp>"}
```

### 1.5 Verify Database Connection
```bash
# In MongoDB client, verify database created
# Use fitness_app database
db.users.find()

# Should show the test user created above
```

---

## Step 2: Frontend Setup & Testing

### 2.1 Install Dependencies
```bash
cd app/frontend
npm install
```

**Expected:** No errors, all dependencies installed successfully.

### 2.2 Verify Environment Configuration
```bash
# Check .env file
cat .env

# Expected output:
# VITE_API_URL=http://localhost:8000/api
# VITE_API_TIMEOUT=30000
# VITE_APP_NAME=DisciplineFlow
# VITE_APP_VERSION=1.0.0
# VITE_ENV=production
```

### 2.3 Build for Production
```bash
npm run build
```

**Expected Output:**
```
✓ built in <time>
dist/index.html
dist/assets/index-<hash>.js
dist/assets/index-<hash>.css
```

### 2.4 Verify Build Output
```bash
ls -la dist/
```

**Expected files:**
- `index.html`
- `assets/index-*.js`
- `assets/index-*.css`

### 2.5 Development Server Test (Optional)
```bash
npm run dev
```

Then visit `http://localhost:5173` in browser - should load without errors.

---

## Step 3: End-to-End Testing

### 3.1 Test API Connectivity
With both backend and frontend running:

```bash
# From frontend terminal, test API call
curl http://localhost:8000/api/users
```

### 3.2 Browser Console Check
1. Open http://localhost:5173
2. Open Developer Tools (F12 → Console)
3. Verify no errors related to:
   - API connection failures
   - Missing environment variables
   - CORS errors

### 3.3 Functional Testing
- [ ] Pages load without errors
- [ ] API calls succeed
- [ ] Data displays correctly
- [ ] No console errors
- [ ] Network requests use correct API URL

---

## Step 4: Production Readiness Checklist

### Code Quality
- [ ] No `console.log()` statements in production code
- [ ] No debug files or test files
- [ ] No API keys in code
- [ ] All dependencies are security-appropriate versions

### Configuration
- [ ] Production MongoDB URL configured
- [ ] Production API URL will be configured at deployment
- [ ] CORS origins properly set
- [ ] Environment variables not committed to git

### Build Artifacts
- [ ] Frontend builds without warnings
- [ ] Build output is minified
- [ ] No duplicate files
- [ ] gitignore properly excludes build artifacts

### Security
- [ ] `.env` files not in git
- [ ] No credentials in code
- [ ] CORS properly configured for production domain

### Documentation
- [ ] DEPLOYMENT_CLEANUP.md completed
- [ ] DEPLOYMENT_TEST_GUIDE.md (this file) reviewed
- [ ] README.md updated with deployment instructions
- [ ] All changes documented in commit messages

---

## Step 5: Common Issues & Solutions

### Backend Issues

**Issue: "ModuleNotFoundError"**
- Solution: Ensure virtual environment activated and `pip install -r requirements.txt` completed

**Issue: "MongoDB connection refused"**
- Solution: Verify MongoDB is running: `mongod`
- Or update MONGO_URL to your MongoDB connection string

**Issue: "Port 8000 already in use"**
- Solution: Kill the process: `lsof -i :8000` then `kill -9 <PID>`
- Or change SERVER_PORT in `.env`

### Frontend Issues

**Issue: "npm install fails"**
- Solution: Clear cache: `npm cache clean --force` and retry

**Issue: "Build fails with CSS errors"**
- Solution: Ensure Tailwind CSS dependencies are installed: `npm install tailwindcss autoprefixer postcss`

**Issue: "API calls return 404"**
- Solution: Verify VITE_API_URL matches backend URL and backend is running

---

## Step 6: Deployment Preparation

1. All tests passing ✓
2. No console errors ✓
3. Environment variables configured ✓
4. Build completes successfully ✓
5. Ready for PR review ✓

**Next Steps:**
- Create PR from v1.1 to main
- Request code review
- After approval, proceed to deployment

---

## Support

For issues, refer to:
1. DEPLOYMENT_CLEANUP.md - Cleanup requirements
2. server.py logs - Backend errors
3. Browser console - Frontend errors
4. Network tab - API call details