# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All unit tests passing (94 tests, 0 failures)
- [ ] All E2E tests passing (6 test suites)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No Biome errors (`npm run biome:check`)
- [ ] Build succeeds without critical warnings (`npm run build`)
- [ ] Lighthouse score > 90 (`npm run lighthouse`)
- [ ] Bundle size optimized (`npm run analyze`)

### Security
- [ ] No critical Semgrep findings (`npm run semgrep`)
- [ ] All secrets in environment variables (not hardcoded)
- [ ] Authentication is production-ready (not demo mode)
- [ ] Password hashing enabled (bcrypt configured)
- [ ] Rate limiting configured (Upstash Redis)
- [ ] CORS configured correctly
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Content Security Policy configured

### Authentication & Authorization
- [ ] JWT secret configured (JOSE library)
- [ ] Session storage configured (Redis/database)
- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] Failed login attempts tracked
- [ ] Account lockout policy configured
- [ ] Email verification enabled (if applicable)
- [ ] Password reset flow tested
- [ ] MFA/2FA configured (if applicable)

### Database
- [ ] Production database provisioned
- [ ] Database schema created
- [ ] Migrations tested and ready
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Database indexes optimized
- [ ] Query performance tested
- [ ] Database credentials secured

### Environment Variables
- [ ] All .env variables documented in .env.example
- [ ] Production environment variables set in hosting platform
- [ ] No sensitive data in version control
- [ ] Environment-specific configs tested
- [ ] API keys rotated for production

**Required Environment Variables:**
```bash
# Authentication
JWT_SECRET=
SESSION_SECRET=

# Database
DATABASE_URL=

# Redis (Rate Limiting & Sessions)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# AI Services
OPENAI_API_KEY=

# Monitoring (Optional)
SENTRY_DSN=
NEXT_PUBLIC_GA_ID=

# Feature Flags
NODE_ENV=production
NEXT_PUBLIC_APP_URL=
```

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] Bundle size optimized (shared < 150KB)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting configured
- [ ] Caching configured (Cache-Control headers)
- [ ] CDN configured for static assets
- [ ] Service Worker configured (PWA)
- [ ] Critical CSS inlined
- [ ] Font loading optimized

### Monitoring & Logging
- [ ] Error tracking configured (Sentry/Bugsnag)
- [ ] Application logging configured
- [ ] Performance monitoring configured (Vercel Analytics)
- [ ] Alerts configured for errors
- [ ] Alerts configured for performance degradation
- [ ] Uptime monitoring configured
- [ ] Log retention policy set
- [ ] Audit logging for sensitive operations

### Infrastructure
- [ ] Hosting platform configured (Vercel/Netlify/etc)
- [ ] Custom domain configured
- [ ] DNS configured correctly
- [ ] SSL/TLS certificate configured
- [ ] Auto-scaling configured (if applicable)
- [ ] Load balancer configured (if applicable)
- [ ] Firewall rules configured
- [ ] DDoS protection enabled

### Documentation
- [ ] README.md updated with deployment instructions
- [ ] API documentation complete
- [ ] Architecture documentation updated
- [ ] Runbook created for common issues
- [ ] Rollback procedures documented
- [ ] Incident response plan documented

### Testing
- [ ] Smoke tests created and passing
- [ ] Critical user flows tested end-to-end
- [ ] Performance tested under load
- [ ] Security penetration testing completed
- [ ] Accessibility testing completed (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness tested
- [ ] Staging environment tested

### Compliance & Legal
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented (if EU users)
- [ ] GDPR compliance verified (if EU users)
- [ ] Data retention policy implemented
- [ ] User data export capability implemented
- [ ] User data deletion capability implemented

## Deployment

### Build Process
1. [ ] Create production build
   ```bash
   npm run build
   ```

2. [ ] Verify build artifacts
   - Check .next/standalone directory
   - Verify static assets in .next/static
   - Confirm public assets copied

3. [ ] Run post-build validation
   ```bash
   # Start production server locally
   npm start

   # Verify critical pages load
   curl http://localhost:3000
   curl http://localhost:3000/api/health
   ```

### Pre-Flight Checks
- [ ] All environment variables set in production
- [ ] Database migrations ready
- [ ] Backup created of current production (if applicable)
- [ ] Rollback plan documented and tested
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)

### Deployment Steps
1. [ ] Deploy to staging environment first
2. [ ] Run smoke tests on staging
3. [ ] Verify critical functionality on staging
4. [ ] Deploy to production
5. [ ] Monitor deployment for errors
6. [ ] Verify critical functionality on production

### Database Migrations
- [ ] Review migration scripts
- [ ] Test migrations on staging
- [ ] Backup database before migration
- [ ] Run migrations on production
- [ ] Verify migration success
- [ ] Test data integrity

## Post-Deployment

### Immediate Verification (0-15 minutes)
- [ ] Verify production build works (homepage loads)
- [ ] Test critical user flows:
  - [ ] User can view homepage
  - [ ] User can navigate to key pages
  - [ ] User can login (if authenticated)
  - [ ] User can submit forms
  - [ ] API endpoints respond correctly
- [ ] Monitor error rates (should be < 1%)
- [ ] Check performance metrics:
  - [ ] Response times < 2s
  - [ ] Time to First Byte (TTFB) < 600ms
  - [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Verify database connections working
- [ ] Test rate limiting (should block after threshold)
- [ ] Verify service worker installed (PWA)
- [ ] Check SSL certificate valid

### Short-Term Monitoring (15min - 2 hours)
- [ ] Monitor server logs for errors
- [ ] Check error tracking dashboard
- [ ] Monitor performance metrics
- [ ] Verify analytics tracking
- [ ] Test key integrations:
  - [ ] AI chat functionality
  - [ ] Email sending (if applicable)
  - [ ] Payment processing (if applicable)
  - [ ] Third-party APIs
- [ ] Check cache hit rates
- [ ] Monitor memory usage
- [ ] Monitor CPU usage
- [ ] Verify CDN serving assets

### Long-Term Monitoring (2+ hours)
- [ ] Set up recurring health checks
- [ ] Monitor user feedback
- [ ] Track conversion metrics
- [ ] Review performance trends
- [ ] Check SEO rankings (after 24-48h)
- [ ] Verify scheduled jobs running (if applicable)
- [ ] Monitor database performance
- [ ] Review security alerts
- [ ] Check backup completion

### Performance Benchmarks
**Target Metrics:**
- Page Load Time: < 2 seconds
- Time to Interactive (TTI): < 3 seconds
- First Contentful Paint (FCP): < 1 second
- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Server Response Time: < 600ms
- Error Rate: < 1%
- Uptime: > 99.9%

## Rollback Plan

### Triggers for Rollback
- Error rate > 5%
- Critical functionality broken
- Performance degradation > 50%
- Security vulnerability discovered
- Database corruption detected

### Rollback Procedure
1. [ ] Assess severity of issue
2. [ ] Notify team of rollback decision
3. [ ] Create snapshot of broken deployment (for debugging)
4. [ ] Revert to previous version:
   ```bash
   # Using git tags
   git checkout v1.0.0
   npm run build
   npm start

   # Or using hosting platform rollback feature
   vercel rollback
   ```
5. [ ] Verify previous version working
6. [ ] Monitor for stability
7. [ ] Investigate root cause
8. [ ] Plan fix and re-deployment

### Database Rollback
- [ ] Stop application (prevent writes)
- [ ] Restore database from backup
- [ ] Run rollback migrations (if needed)
- [ ] Verify data integrity
- [ ] Restart application
- [ ] Validate critical data

## Post-Rollback
- [ ] Document what went wrong
- [ ] Create incident report
- [ ] Plan fixes for issues
- [ ] Update tests to catch issue
- [ ] Schedule re-deployment

## Success Criteria

**Deployment is successful when:**
1. All critical functionality working
2. Error rate < 1%
3. Performance metrics within targets
4. No critical security issues
5. All monitoring systems green
6. User feedback positive
7. Key metrics stable for 24 hours

## Emergency Contacts

**Development Team:**
- Lead Developer: [Contact]
- Backend Developer: [Contact]
- Frontend Developer: [Contact]

**Infrastructure:**
- DevOps Engineer: [Contact]
- Database Admin: [Contact]

**Business:**
- Product Manager: [Contact]
- CTO/Technical Lead: [Contact]

**External:**
- Hosting Support: [Vercel/Netlify Support]
- Database Provider: [Support Contact]
- Monitoring Service: [Support Contact]

## Maintenance Windows

**Preferred Deployment Times:**
- Staging: Any time
- Production: Tuesday-Thursday, 10am-2pm UTC
- Avoid: Friday afternoons, weekends, holidays

**Communication:**
- Announce maintenance 24-48h in advance
- Update status page during deployment
- Send completion notification

---

## Quick Reference Commands

```bash
# Build and test
npm run build
npm run test:run
npm run test:e2e
npm run typecheck
npm run biome:check
npm run semgrep

# Start production server
npm start

# Health check
curl http://localhost:3000/api/health

# View logs
npm run logs:production

# Rollback (Vercel)
vercel rollback

# Database migration
npm run db:migrate

# Clear cache
npm run cache:clear
```

---

**Last Updated:** 2025-12-11
**Version:** 1.0.0
**Maintained by:** QA Tester Agent
