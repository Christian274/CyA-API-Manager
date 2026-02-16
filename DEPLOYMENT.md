# PXM-API-Manager Deployment Guide

## Overview
The PXM-API-Manager is a React-based application for managing CyberArk Safes, Members, and Accounts through REST API calls. This guide covers deployment options and configuration.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Configuration](#build-configuration)
3. [Deployment Options](#deployment-options)
4. [Production Setup](#production-setup)
5. [Security Considerations](#security-considerations)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] Set `REACT_APP_DEBUG_MODE=false` in production environment
- [ ] Update CyberArk PVWA instance URL (if pre-configuring)
- [ ] Verify all dependencies are installed: `npm install`
- [ ] Run tests if available: `npm test`
- [ ] Build the application: `npm run build`
- [ ] Verify `dist/` folder is created with production assets
- [ ] Review environment variables in .env.production
- [ ] Ensure HTTPS is enabled on deployment server
- [ ] Configure CORS if CyberArk is on different domain

---

## Build Configuration

### Development Build
```bash
# Uses .env.local for configuration
npm run dev
```

### Production Build
```bash
# Uses .env.production for configuration
npm run build

# Output: dist/ folder ready for deployment
```

### Specify Environment
```bash
# Build with production variables
VITE_ENV=production npm run build

# Build with debug mode enabled (for testing)
REACT_APP_DEBUG_MODE=true npm run build
```

---

## Deployment Options

### Option 1: Static Web Server (Recommended)

Deploy to any static web hosting (AWS S3, Azure Static Web Apps, Netlify, Vercel, etc.)

```bash
# 1. Build the application
npm run build

# 2. Upload contents of dist/ folder to your web server
# 3. Configure your web server to serve index.html for all routes (SPA routing)
```

**Web Server Configuration (nginx example):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/pxm-api-manager/dist;
    index index.html;

    # SPA routing - serve index.html for all non-file requests
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
}
```

**Apache Configuration:**
```apache
<Directory /var/www/pxm-api-manager/dist>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</Directory>
```

### Option 2: Docker Container

Create a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_DEBUG_MODE=false
ARG REACT_APP_ENV=production
ENV REACT_APP_DEBUG_MODE=$REACT_APP_DEBUG_MODE
ENV REACT_APP_ENV=$REACT_APP_ENV
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
# Build image
docker build \
  --build-arg REACT_APP_DEBUG_MODE=false \
  --build-arg REACT_APP_ENV=production \
  -t pxm-api-manager:1.0.0 .

# Run container
docker run -p 80:80 -e REACT_APP_CYBERARK_API_URL=https://cyberark.company.com:8443 pxm-api-manager:1.0.0
```

### Option 3: Node.js Server

For direct Node.js deployment (not recommended for production, use a reverse proxy):

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Use a static server like serve
npm install -g serve
serve -s dist -l 3000
```

### Option 4: Cloud Platforms

#### AWS S3 + CloudFront
```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket/pxm-api-manager/

# 3. Create CloudFront distribution pointing to S3
# 4. Configure error handling (404 -> index.html)
```

#### Azure Static Web Apps
```bash
# Use Azure CLI to deploy
az staticwebapp up --name pxm-api-manager --source ./dist
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Production Setup

### Environment Variables

Create `.env.production` for your deployment:

```env
# Disable debug mode
REACT_APP_DEBUG_MODE=false

# Set your CyberArk instance (users can also override on login)
REACT_APP_CYBERARK_API_URL=https://pvwa.company.com:8443

# Add version tracking
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
```

### CORS Configuration

If CyberArk PVWA is on a different domain, configure CORS:

**CyberArk PVWA CORS Headers (Example)**
```
Access-Control-Allow-Origin: https://your-pxm-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### HTTPS/SSL

**Important:** Always use HTTPS in production for security.

**Let's Encrypt (Free SSL):**
```bash
# With certbot
certbot certonly --standalone -d your-domain.com
```

**Nginx with SSL:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/pxm-api-manager/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

Add these headers to your web server for enhanced security:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```

---

## Security Considerations

### 1. Authentication
- **Never** commit authentication tokens to version control
- Always prompt users for credentials on login
- Tokens are stored in localStorage (cleared on logout)
- For automated deployments, use secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)

### 2. API Communication
- Always use HTTPS/TLS for all API calls
- Verify CyberArk SSL certificates in production
- Bearer token authentication is used for all API calls
- Password is cleared from state after authentication

### 3. Debug Mode
- **ALWAYS** set `REACT_APP_DEBUG_MODE=false` in production
- Debug button allows bypassing authentication
- Only enable for development/testing environments

### 4. Environment Variables
- Use `.env.local` for development (git-ignored)
- Use `.env.production` for production (don't commit sensitive data)
- The `.env.example` file shows available options (commit this)

### 5. Content Security Policy
Configure CSP headers to prevent XSS attacks:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://your-cyberark-instance:8443
```

---

## Troubleshooting

### Build Issues

**"REACT_APP_DEBUG_MODE is not defined"**
- Solution: Create `.env.local` file with `REACT_APP_DEBUG_MODE=false`

**Build output is blank or white screen**
- Check browser console for errors (F12)
- Verify all `.env` variables are set correctly
- Clear browser cache and localStorage

### Runtime Issues

**"Cannot connect to CyberArk API"**
- Verify CyberArk PVWA URL is correct
- Check CORS configuration on CyberArk
- Ensure HTTPS/TLS is properly configured
- Verify firewall allows connections to CyberArk instance

**"Blank login screen"**
- Check theme configuration in App.jsx
- Verify Tailwind CSS is properly compiled
- Clear browser cache

**"Debug button not showing but DEBUG_MODE=true"**
- Debug button only shows when `REACT_APP_DEBUG_MODE=true`
- Rebuild after changing environment variables: `npm run build`
- Rebuild is required for environment variable changes to take effect

### Performance Issues

**Application is slow**
- Enable CSS/JS minification (enabled by default in production build)
- Use CDN for static assets
- Enable gzip compression on web server
- Reduce JavaScript bundle size (use `npm run build` analyze if available)

---

## First Deployment Checklist

1. ✅ Clone/download the repository
2. ✅ Install dependencies: `npm install`
3. ✅ Create `.env.production` with correct settings
4. ✅ Verify `REACT_APP_DEBUG_MODE=false`
5. ✅ Build: `npm run build`
6. ✅ Test locally: `npm run dev` with correct CyberArk URL
7. ✅ Deploy `dist/` folder to web server
8. ✅ Configure web server for SPA routing
9. ✅ Enable HTTPS/SSL
10. ✅ Set security headers
11. ✅ Test login with actual CyberArk credentials
12. ✅ Test Safes/Members/Accounts operations
13. ✅ Monitor for errors in browser console
14. ✅ Document deployment details for team

---

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Review CyberArk API documentation
3. Verify network requests in DevTools Network tab
4. Check application logs if running in a container

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-16
