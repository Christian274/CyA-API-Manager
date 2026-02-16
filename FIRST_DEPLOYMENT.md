# Quick Start Deployment Guide

## For First Deployment

### Step 1: Verify Configuration
```bash
# Check that debug mode is disabled in production
cat .env.production
# Should show: REACT_APP_DEBUG_MODE=false
```

### Step 2: Build Production Bundle
```bash
npm run build
```

This creates a `dist/` folder containing your production-ready application.

### Step 3: Choose Your Deployment Target

#### Option A: Simple Web Server (Nginx/Apache)
```bash
# Copy dist folder to your web server
scp -r dist/ user@your-server.com:/var/www/pxm-api-manager/

# SSH into server and configure web server (see DEPLOYMENT.md)
```

#### Option B: Docker Container
```bash
# Build Docker image
docker build -t pxm-api-manager:1.0.0 .

# Run container
docker run -p 80:80 pxm-api-manager:1.0.0
```

#### Option C: Cloud Platform
- **AWS S3 + CloudFront:** `aws s3 sync dist/ s3://your-bucket/`
- **Azure Web Apps:** Use Azure CLI or GitHub Actions
- **Netlify:** Connect GitHub repo for auto-deployment
- **Vercel:** Connect GitHub repo for auto-deployment

### Step 4: Post-Deployment Testing
1. Open application in browser
2. Verify login form shows (NOT debug button)
3. Test authentication with CyberArk credentials
4. Test Safes, Members, and Accounts operations
5. Check browser console (F12) for errors

### Step 5: Production Checklist
- [ ] HTTPS/SSL enabled
- [ ] CyberArk PVWA URL is reachable
- [ ] CORS is configured (if needed)
- [ ] Security headers are set
- [ ] Debug mode is DISABLED
- [ ] Environment variables are set correctly

---

## Environment Variables Explained

### REACT_APP_DEBUG_MODE
- **Development:** `true` (shows debug login button)
- **Production:** `false` (hides debug button, requires real authentication)

### REACT_APP_CYBERARK_API_URL
- Optional - users can enter this on login form
- Pre-set it for convenience (example: `https://pvwa.company.com:8443`)
- If not set, login form will prompt for it

### REACT_APP_ENV
- Used for tracking which environment build is deployed
- **Values:** `development`, `staging`, `production`

---

## Verify Build Output

After `npm run build`, check the dist folder:

```bash
ls -la dist/

# Should contain:
# - index.html (main entry point)
# - assets/ folder with JS/CSS files
```

The production build is optimized, minified, and ready to deploy!

---

## Next Steps

1. See **DEPLOYMENT.md** for detailed deployment instructions
2. Review **security-headers.txt** for web server configuration
3. Test thoroughly in staging environment first

---

**Need Help?**
- Refer to DEPLOYMENT.md for comprehensive guide
- Check browser console (F12) for error messages
- Verify CyberArk PVWA is accessible and CORS is configured
