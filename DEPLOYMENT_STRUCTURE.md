# Project Structure & Deployment Files

## Source Code Structure
```
pxm-api-manager/
├── src/
│   ├── App.jsx                 # Main React component (3500+ lines)
│   ├── App.css                 # Application styles
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── public/                      # Static files
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── eslint.config.js            # ESLint rules
└── README.md                    # Project readme
```

## Deployment Configuration Files

### Environment Files
```
.env.example               # Template showing all available options (COMMIT THIS)
.env.local                 # Development environment (git-ignored)
.env.production            # Production environment (git-ignored)
```

### Build Output
```
dist/                      # Generated production build (created by npm run build)
├── index.html            # Main HTML file
├── assets/
│   ├── index-[hash].js   # Minified app bundle
│   └── index-[hash].css  # Compiled Tailwind CSS
└── ...other assets
```

### Documentation Files
```
DEPLOYMENT.md             # Comprehensive deployment guide
FIRST_DEPLOYMENT.md       # Quick start guide for first deployment
```

## Key Features Ready for Deployment

✅ **Debug Mode Toggle**
- `REACT_APP_DEBUG_MODE` environment variable
- When `false` (production): Debug button is hidden
- When `true` (development): Debug button visible for testing
- Prevents accidental debug access in production

✅ **CyberArk REST API Integration**
- Dynamic API layer using current authentication state
- Safe, Member, Account CRUD operations
- Bearer token authentication
- Error handling with user notifications

✅ **Connection Status Tracking**
- Dashboard shows real-time CONNECTED/DISCONNECTED status
- Based on authentication state (authToken + isLoggedIn)
- Automatic update on login/logout

✅ **Auto-Data Fetching**
- Modify/Remove tabs automatically fetch data when accessed
- GET calls to safeAPI.getAll(), memberAPI.getBySafe(), accountAPI.getAll()
- Graceful error handling (keeps existing data on error)

✅ **Security Features**
- HTTPS/TLS ready
- CORS support for multi-domain deployments
- Bearer token-based authentication
- Passwords cleared from state after authentication
- localStorage for secure token storage

✅ **Responsive Design**
- Dark/Light mode support
- Mobile-friendly Tailwind CSS
- Accessible UI components

## Build Commands

```bash
# Development (with debug mode)
npm run dev              # Starts dev server with hot reload

# Production
npm run build            # Optimized production build
npm run build:preview    # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run format          # Format code (if prettier configured)
```

## Deployment Checklist

- [ ] Read FIRST_DEPLOYMENT.md
- [ ] Read DEPLOYMENT.md for detailed instructions
- [ ] Copy .env.example to .env.production
- [ ] Set REACT_APP_DEBUG_MODE=false
- [ ] Configure CyberArk PVWA URL (optional)
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Test locally with `npm run dev`
- [ ] Deploy dist/ folder
- [ ] Configure web server routing
- [ ] Enable HTTPS/SSL
- [ ] Set security headers
- [ ] Test with real credentials

## Production Build Size

Current optimized build:
- **dist/index.html**: 0.38 kB (gzipped: 0.26 kB)
- **dist/assets/index-[hash].js**: ~286 kB (gzipped: ~78 kB)
- **Total**: ~286 kB uncompressed, ~78 kB gzipped

Modern browsers can load this in seconds with proper caching headers.

## First Deployment Steps

1. Use `.env.local` for development (DEBUG_MODE=true)
2. Use `.env.production` for production (DEBUG_MODE=false)
3. Build: `npm run build`
4. Deploy `dist/` folder to web server
5. Configure server for SPA routing (all 404s → index.html)
6. Enable HTTPS and security headers
7. Test login with real CyberArk credentials
8. Verify all CRUD operations work

See DEPLOYMENT.md and FIRST_DEPLOYMENT.md for complete instructions!
