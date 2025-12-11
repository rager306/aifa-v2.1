# PWA Security Status

## Overview

This document tracks known security vulnerabilities in PWA dependencies and their mitigation strategies.

## Known Vulnerabilities

### next-pwa transitive dependencies

We are using `next-pwa@5.6.0` (latest version) which includes workbox dependencies with known vulnerabilities.

#### SNYK-JS-INFLIGHT-6095116
- **Component**: `inflight` (transitive dependency via workbox)
- **Severity**: Medium
- **Status**: Accepted with mitigation
- **Expiry**: 2025-03-01

**Mitigation:**
- PWA only caches static assets (images, fonts, API responses)
- No user input flows through vulnerable code paths
- Service worker runs in isolated browser context
- Runtime caching uses predefined URL patterns only

#### SNYK-JS-SERIALIZEJAVASCRIPT-6147607
- **Component**: `serialize-javascript` (transitive via workbox-webpack-plugin)
- **Severity**: Medium
- **Status**: Accepted with mitigation
- **Expiry**: 2025-03-01

**Mitigation:**
- PWA only serializes static cache configurations
- No user-controlled data passed to serialization functions
- Service worker operates in isolated context with limited scope
- All runtime caching patterns are predefined and validated

## PWA Configuration Summary

Current PWA setup (from `next.config.mjs`):

```javascript
withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Images - CacheFirst strategy
    // Fonts - CacheFirst strategy
    // API routes - NetworkFirst with 5min expiration
    // Same-origin requests - NetworkFirst with 24hr expiration
  ]
})
```

## Action Plan

### Monthly Monitoring
- Check for next-pwa updates that resolve workbox vulnerabilities
- Review npm security advisories for workbox ecosystem
- Monitor Snyk database for new vulnerabilities

### Quarterly Review Schedule
- **Next Review**: 2025-03-01
- **Review Checklist**:
  - [ ] Check if next-pwa has released versions with updated workbox
  - [ ] Evaluate upgrade path and breaking changes
  - [ ] Test PWA functionality after any upgrades
  - [ ] Re-assess vulnerability status
  - [ ] Update `.snyk` policy expiry dates

### Upgrade Criteria
Consider upgrading when:
1. next-pwa releases version with updated workbox dependencies
2. Workbox team releases patches for known vulnerabilities
3. Severity of vulnerabilities increases
4. New attack vectors are discovered

## Security Best Practices

Current implementation follows these security practices:

1. **Limited Scope**: Service worker only caches predefined resources
2. **No User Data**: No user-controlled input in cache keys or values
3. **Isolation**: Service worker runs in separate context from main app
4. **Network-First**: API routes use NetworkFirst to prioritize fresh data
5. **Expiration**: All caches have max age limits (5min-1year)
6. **Same-Origin**: Generic catch-all only matches same-origin requests

## References

- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Security Best Practices](https://developer.chrome.com/docs/workbox/)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [Service Worker Security Considerations](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#security_considerations)

## Last Updated

- **Date**: 2025-12-11
- **next-pwa Version**: 5.6.0
- **Reviewer**: Security Team
- **Next Review**: 2025-03-01
