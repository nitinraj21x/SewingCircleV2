# Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed or documented
- [ ] Code reviewed and approved
- [ ] Git repository is clean (no uncommitted changes)
- [ ] All dependencies are up to date
- [ ] Run `npm audit` and fix vulnerabilities

### Environment Setup
- [ ] `.env.example` files created for both frontend and backend
- [ ] `.env` files added to `.gitignore`
- [ ] All sensitive data removed from code
- [ ] Environment variables documented
- [ ] Generate secure JWT secrets (run `node scripts/generate-secrets.js`)

### Database
- [ ] MongoDB Atlas account created
- [ ] Database cluster created (M0 Free tier or higher)
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for production)
- [ ] Connection string obtained and tested
- [ ] Database indexes created
- [ ] Seed data prepared (if needed)

### Image Storage
- [ ] Cloudinary account created
- [ ] Cloud name, API key, and API secret obtained
- [ ] Upload presets configured (if needed)
- [ ] Storage limits understood

### Repository
- [ ] Code pushed to GitHub/GitLab
- [ ] Repository is public or hosting service has access
- [ ] README.md is complete and accurate
- [ ] License file added (if applicable)

## Deployment

### Backend Deployment (Render/Railway/etc.)
- [ ] Hosting account created
- [ ] New web service created
- [ ] Repository connected
- [ ] Root directory set correctly (`AC_SewingCircle/v3.1/backend`)
- [ ] Build command configured (`npm install`)
- [ ] Start command configured (`npm start`)
- [ ] All environment variables added:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] JWT_REFRESH_SECRET
  - [ ] PORT
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
- [ ] Service deployed successfully
- [ ] Backend URL noted and saved

### Frontend Deployment (Vercel/Netlify/etc.)
- [ ] Hosting account created
- [ ] New project created
- [ ] Repository connected
- [ ] Framework preset selected (Vite)
- [ ] Root directory set correctly (`AC_SewingCircle/v3.1/frontend`)
- [ ] Build command configured (`npm run build`)
- [ ] Output directory configured (`dist`)
- [ ] Environment variables added:
  - [ ] VITE_API_URL (backend URL)
  - [ ] VITE_EMAILJS_SERVICE_ID (if using EmailJS)
  - [ ] VITE_EMAILJS_TEMPLATE_ID
  - [ ] VITE_EMAILJS_PUBLIC_KEY
- [ ] Project deployed successfully
- [ ] Frontend URL noted and saved

### CORS Configuration
- [ ] Backend FRONTEND_URL updated with actual frontend URL
- [ ] Backend redeployed with new CORS settings
- [ ] CORS tested from frontend

### Database Seeding
- [ ] Admin user created (username: admin, password: follow.admin)
- [ ] Sample events added (optional)
- [ ] Database connection verified from backend

## Post-Deployment

### Testing
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Events display correctly
- [ ] Images load and display
- [ ] Image upload works
- [ ] Profile pages load
- [ ] Feed displays posts (if implemented)
- [ ] All API endpoints respond correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images optimized and compressed
- [ ] Lighthouse score > 80 (Performance, Accessibility, Best Practices, SEO)
- [ ] No console errors in browser
- [ ] No 404 errors for resources

### Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] All secrets are secure and not exposed
- [ ] CORS configured correctly (not allowing all origins)
- [ ] Rate limiting implemented (if needed)
- [ ] Input validation working
- [ ] XSS protection enabled
- [ ] CSRF protection enabled (if needed)
- [ ] Security headers configured (helmet.js)

### Monitoring
- [ ] Health check endpoint working (`/health`)
- [ ] Error tracking setup (Sentry or similar)
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom)
- [ ] Analytics setup (Google Analytics or similar)
- [ ] Log aggregation configured
- [ ] Alerts configured for critical errors

### Backup & Recovery
- [ ] Database backup strategy defined
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

### Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Admin credentials securely stored
- [ ] Troubleshooting guide created
- [ ] Runbook for common operations created

### Domain & DNS (Optional)
- [ ] Domain purchased
- [ ] DNS records configured
- [ ] Frontend domain pointed to hosting
- [ ] Backend subdomain configured (api.yourdomain.com)
- [ ] SSL certificate issued for custom domain
- [ ] Domain propagation verified (24-48 hours)

### Email Configuration (Optional)
- [ ] Email service configured (SendGrid, Mailgun, etc.)
- [ ] Email templates created
- [ ] Test emails sent and received
- [ ] Email notifications working:
  - [ ] User registration confirmation
  - [ ] Admin approval notification
  - [ ] Password reset emails

### SEO & Marketing
- [ ] Meta tags added (title, description, og:image)
- [ ] Favicon added
- [ ] robots.txt configured
- [ ] Sitemap.xml created
- [ ] Google Search Console setup
- [ ] Social media preview images added
- [ ] Analytics tracking verified

## Launch

### Pre-Launch
- [ ] All checklist items above completed
- [ ] Stakeholders notified of launch date
- [ ] Support team briefed
- [ ] Launch announcement prepared

### Launch Day
- [ ] Final smoke test completed
- [ ] Monitoring dashboards open
- [ ] Team on standby for issues
- [ ] Launch announcement sent
- [ ] Social media posts published

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check server performance
- [ ] Review user feedback
- [ ] Address critical issues immediately
- [ ] Document any issues encountered

### Post-Launch (First Week)
- [ ] Review analytics data
- [ ] Gather user feedback
- [ ] Identify and prioritize improvements
- [ ] Plan next iteration
- [ ] Update documentation based on learnings

## Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review user reports

### Weekly
- [ ] Review analytics
- [ ] Check database performance
- [ ] Update dependencies (if needed)
- [ ] Backup verification

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Cost analysis
- [ ] Feature planning
- [ ] Database optimization

### Quarterly
- [ ] Major dependency updates
- [ ] Infrastructure review
- [ ] Disaster recovery drill
- [ ] User survey

## Rollback Plan

If something goes wrong:

1. **Immediate Actions**
   - [ ] Identify the issue
   - [ ] Notify team
   - [ ] Check if rollback is needed

2. **Rollback Steps**
   - [ ] Revert to previous deployment (hosting platforms usually have one-click rollback)
   - [ ] Restore database from backup (if needed)
   - [ ] Update DNS if domain was changed
   - [ ] Notify users of temporary issues

3. **Post-Rollback**
   - [ ] Investigate root cause
   - [ ] Fix issues in development
   - [ ] Test thoroughly
   - [ ] Plan re-deployment

## Support Contacts

- **Hosting Support**: [Platform support link]
- **Database Support**: MongoDB Atlas support
- **Domain Registrar**: [Your registrar support]
- **Development Team**: [Contact information]

## Notes

Use this space to document any deployment-specific notes, issues encountered, or lessons learned:

```
Date: ___________
Deployed by: ___________
Notes:




```

---

## Quick Commands

### Generate Secrets
```bash
node scripts/generate-secrets.js
```

### Check Deployment Readiness
```bash
node scripts/check-deployment.js
```

### Build Frontend Locally
```bash
cd frontend
npm run build
```

### Test Backend Locally
```bash
cd backend
npm start
```

### Seed Database
```bash
cd backend
node seed.js
```

---

**Last Updated**: [Date]
**Deployment Version**: v3.1
**Deployed By**: [Name]
