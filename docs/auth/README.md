# Authentication System Documentation

Production-ready authentication for AIFA v2.1 with bcrypt, Upstash Redis rate limiting, and database-backed sessions.

## Quick Links

- **[Quick Start Guide](./QUICK-START.md)** - Get started in 5 minutes
- **[Production Auth Guide](./PRODUCTION-AUTH.md)** - Complete documentation
- **[Database Setup](./DATABASE-SETUP.md)** - Database configuration guide

## Overview

This authentication system replaces the demo code with production-ready features:

### Security Features

- **bcrypt Password Hashing** - Industry-standard with 12 salt rounds
- **Upstash Redis Rate Limiting** - 5 attempts per 15 minutes per email
- **Database-Backed Sessions** - PostgreSQL/Supabase with 7-day expiry
- **Secure Cookies** - HttpOnly, Secure (production), SameSite=Lax
- **Security Auditing** - IP address and User-Agent tracking
- **Timing Attack Prevention** - Constant-time comparisons and delays
- **Session Validation** - Expiration checking on every request

### Implementation Files

```
lib/
├── auth/
│   ├── password.ts              # bcrypt password hashing
│   │   ├── hashPassword()       - Hash plaintext password
│   │   ├── verifyPassword()     - Verify against hash
│   │   ├── validatePasswordStrength() - Check requirements
│   │   ├── needsRehash()        - Check if rehashing needed
│   │   └── generateSecurePassword() - Generate random password
│   │
│   └── upstash-rate-limiter.ts  # Upstash Redis rate limiting
│       ├── checkLoginRateLimit() - Check and increment
│       ├── resetRateLimit()      - Clear counter
│       ├── getRateLimitStatus()  - Check without incrementing
│       └── createCustomRateLimiter() - Custom limits
│
├── db/
│   ├── schema.sql               # PostgreSQL database schema
│   │   ├── users table          - User accounts
│   │   ├── sessions table       - Active sessions
│   │   ├── password_reset_tokens - Password reset
│   │   └── email_verification_tokens - Email verification
│   │
│   └── client.ts                # Database client interface
│       ├── findUserByEmail()    - Get user by email
│       ├── findUserById()       - Get user by ID
│       ├── createUser()         - Register new user
│       ├── createSession()      - Create session
│       ├── findSessionByToken() - Get session
│       ├── deleteSession()      - Delete session
│       ├── deleteAllUserSessions() - Logout all devices
│       ├── cleanupExpiredSessions() - Remove old sessions
│       ├── updateLastLogin()    - Track login time
│       └── verifyUserEmail()    - Mark email verified
│
app/@left/(_AUTH)/login/(_server)/actions/
└── auth.ts                      # Server actions
    ├── loginAction()            - User login
    ├── logoutAction()           - User logout
    ├── isAuthenticated()        - Check auth status
    └── getUserSession()         - Get user data

scripts/
├── create-admin.ts              # Create admin user
└── cleanup-sessions.ts          # Session cleanup cron job

docs/auth/
├── README.md                    # This file
├── QUICK-START.md              # 5-minute setup guide
├── PRODUCTION-AUTH.md          # Complete documentation
└── DATABASE-SETUP.md           # Database setup guide
```

## Getting Started

### 1. Quick Start (5 minutes)

Follow [QUICK-START.md](./QUICK-START.md) for rapid setup:

1. Database setup (Supabase or local PostgreSQL)
2. Upstash Redis configuration
3. Create admin user
4. Test authentication

### 2. Production Setup

See [PRODUCTION-AUTH.md](./PRODUCTION-AUTH.md) for:

- Detailed security features
- Complete API reference
- Testing strategies
- Maintenance procedures
- Security best practices
- Troubleshooting guide

### 3. Database Setup

See [DATABASE-SETUP.md](./DATABASE-SETUP.md) for:

- Supabase setup (recommended)
- Vercel Postgres setup
- Neon setup
- Railway setup
- Local PostgreSQL setup
- Database management tools
- Backup and restore

## Architecture

### Authentication Flow

```
1. User submits login form
   ↓
2. Server validates email format
   ↓
3. Check rate limit (Upstash Redis)
   ├─ Too many attempts → Reject
   └─ OK → Continue
   ↓
4. Find user in database by email
   ├─ Not found → Reject (with delay)
   └─ Found → Continue
   ↓
5. Verify password with bcrypt
   ├─ Invalid → Reject (with delay)
   └─ Valid → Continue
   ↓
6. Generate secure session token (UUID v4)
   ↓
7. Store session in database with:
   - User ID
   - Token
   - Expiration (7 days)
   - IP address
   - User agent
   ↓
8. Set secure cookie (HttpOnly, Secure, SameSite)
   ↓
9. Return success
```

### Session Validation Flow

```
1. Request comes in
   ↓
2. Extract session cookie
   ├─ No cookie → Not authenticated
   └─ Has cookie → Continue
   ↓
3. Query database for session by token
   ├─ Not found → Not authenticated
   └─ Found → Continue
   ↓
4. Check expiration
   ├─ Expired → Not authenticated
   └─ Valid → Authenticated
   ↓
5. Return user data
```

## Environment Variables

Required in `.env.local`:

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Upstash Redis (Required for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Auth Secret (Optional)
AUTH_SECRET="generate-with-openssl-rand-base64-32"
```

## Database Schema

### users
- `id` - UUID primary key
- `email` - Unique email address
- `password_hash` - bcrypt hash
- `name` - User's name (optional)
- `role` - User role (user, admin, etc.)
- `email_verified` - Boolean
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updated)

### sessions
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `token` - Unique session token
- `expires_at` - Expiration timestamp
- `ip_address` - Client IP (optional)
- `user_agent` - Client user agent (optional)
- `created_at` - Timestamp

### password_reset_tokens (optional)
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `token` - Unique reset token
- `expires_at` - Expiration timestamp
- `used` - Boolean
- `created_at` - Timestamp

### email_verification_tokens (optional)
- Same structure as password_reset_tokens

## API Reference

### Server Actions

#### `loginAction(prevState, formData)`
Authenticate user and create session.

**Parameters:**
- `formData.email` - User email
- `formData.password` - User password

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `logoutAction()`
Delete session and redirect to home.

**Returns:** Redirects to `/`

#### `isAuthenticated()`
Check if user has valid session.

**Returns:** `Promise<boolean>`

#### `getUserSession()`
Get current user data.

**Returns:**
```typescript
{
  id: string;
  email: string;
  role: string;
  name: string;
} | null
```

### Password Utilities

#### `hashPassword(password: string)`
Hash password with bcrypt.

#### `verifyPassword(password: string, hash: string)`
Verify password against hash.

#### `validatePasswordStrength(password: string)`
Check password requirements.

#### `needsRehash(hash: string)`
Check if hash should be updated.

#### `generateSecurePassword(length?: number)`
Generate random password.

### Rate Limiting

#### `checkLoginRateLimit(identifier: string)`
Check and increment rate limit counter.

**Returns:**
```typescript
{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
```

## Development vs Production

### Development Mode

When database not configured:
- Shows helpful error messages
- Falls back to mock data
- Allows testing without full setup
- Logs warnings to console

### Production Mode

When properly configured:
- Full database authentication
- Upstash rate limiting
- Secure session management
- Security auditing

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated** - Run `npm audit`
3. **Monitor failed login attempts**
4. **Rotate auth secrets regularly**
5. **Enable 2FA for admin accounts**
6. **Regular database backups**
7. **Clean expired sessions** - Run `cleanup-sessions.ts` daily
8. **Review security logs**
9. **Use strong password requirements**
10. **Implement account lockout**

## Maintenance

### Daily Tasks
- Monitor failed login attempts
- Review error logs

### Weekly Tasks
- Check active sessions count
- Review security alerts

### Monthly Tasks
- Backup database
- Update dependencies
- Rotate secrets (if policy requires)
- Review access logs

### Quarterly Tasks
- Security audit
- Performance review
- Update documentation

## Troubleshooting

### Common Issues

**"Database not configured"**
- Check `DATABASE_URL` in `.env.local`
- Verify database is running
- Run migrations

**"Rate limiter not configured"**
- Check Upstash credentials
- System works but won't rate limit

**"Invalid credentials"**
- Verify user exists
- Check password was hashed
- Test with known credentials

**Sessions expire immediately**
- Check timezone settings
- Verify expiration logic
- Review cookie settings

See [PRODUCTION-AUTH.md](./PRODUCTION-AUTH.md) for detailed troubleshooting.

## Migration from Demo

The production code is backward compatible:

1. Demo code preserved in comments
2. Automatic development mode fallback
3. Helpful error messages
4. No breaking changes

To migrate:
1. Set up database
2. Configure Upstash
3. Create admin user
4. Test authentication

## Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Use email_verification_tokens table
   - Send verification email
   - Block login until verified

2. **Password Reset**
   - Use password_reset_tokens table
   - Send reset email
   - Implement reset flow

3. **OAuth/SSO**
   - Add Google/GitHub login
   - Use NextAuth.js
   - Link social accounts

4. **Multi-Factor Authentication**
   - TOTP support
   - SMS verification
   - Backup codes

5. **Session Management UI**
   - Show active sessions
   - Logout all devices
   - Display login history

## Support

- **Issues**: Create GitHub issue with `[auth]` tag
- **Documentation**: See `docs/auth/` directory
- **Database Schema**: See `lib/db/schema.sql`
- **Example Code**: See `app/@left/(_AUTH)/login/(_server)/actions/auth.ts`

## License

Same as parent project (AIFA v2.1).

---

**Status**: Production Ready ✅

**Last Updated**: 2025-12-11

**Version**: 1.0.0
