# Production Authentication Setup Guide

Complete guide for setting up production-ready authentication in AIFA v2.1.

## Overview

The production authentication system includes:

- **bcrypt password hashing** - Secure credential storage with 12 salt rounds
- **Upstash Redis rate limiting** - Prevent brute force attacks (5 attempts per 15 minutes)
- **Database-backed sessions** - PostgreSQL/Supabase session management
- **Secure cookies** - HttpOnly, Secure, SameSite protection
- **Security auditing** - IP address and User-Agent tracking

## Quick Start

### 1. Install Dependencies

Already installed if you followed the implementation:

```bash
npm install bcrypt @upstash/ratelimit @upstash/redis
npm install --save-dev @types/bcrypt
```

### 2. Set Up Database

#### Option A: PostgreSQL

```bash
# Install PostgreSQL client
npm install pg
npm install --save-dev @types/pg

# Run migrations
psql -h your-host -U your-user -d your-database -f lib/db/schema.sql
```

#### Option B: Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Paste contents of `lib/db/schema.sql`
5. Run the SQL script
6. Get connection string from Settings → Database

#### Option C: Vercel Postgres

```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Create database in Vercel dashboard
# Get connection string from project settings
```

### 3. Set Up Upstash Redis

1. Create free account at [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST API credentials:
   - REST URL
   - REST Token

### 4. Configure Environment Variables

Edit `.env.local`:

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database"
# or for Supabase:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Auth Secret (optional, for additional encryption)
AUTH_SECRET="generate-a-long-random-string"
```

### 5. Implement Database Client

Edit `lib/db/client.ts` and choose your implementation:

#### PostgreSQL Example

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

// Implement other functions similarly...
```

#### Supabase Example

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}

// Implement other functions similarly...
```

### 6. Create Admin User

Use the password hashing utility to create your first user:

```typescript
// scripts/create-admin.ts
import { hashPassword } from '@/lib/auth/password';
import { createUser } from '@/lib/db/client';

async function createAdmin() {
  const passwordHash = await hashPassword('YourSecurePassword123!');

  const admin = await createUser({
    email: 'admin@example.com',
    password_hash: passwordHash,
    name: 'Admin User',
    role: 'admin',
  });

  console.log('Admin user created:', admin.id);
}

createAdmin();
```

Run with:

```bash
npx tsx scripts/create-admin.ts
```

## Database Schema

The authentication system uses these tables:

### users
- Primary user accounts
- Email (unique), password hash, name, role
- Email verification status
- Timestamps

### sessions
- Active authentication sessions
- Session token (unique), user reference
- Expiration timestamp
- IP address and User-Agent for security

### password_reset_tokens (optional)
- One-time tokens for password reset
- Token, user reference, expiration
- Used/unused status

### email_verification_tokens (optional)
- One-time tokens for email verification
- Similar to password reset tokens

## Security Features

### Password Hashing
- **Algorithm**: bcrypt with 12 salt rounds
- **Strength validation**: 8+ chars, uppercase, lowercase, number, special char
- **Automatic rehashing**: If salt rounds increase

### Rate Limiting
- **Provider**: Upstash Redis with sliding window
- **Limits**: 5 login attempts per 15 minutes per email
- **Tracking**: By email address
- **Fallback**: Allows requests if Redis unavailable (logs warning)

### Session Management
- **Tokens**: Cryptographically secure UUID v4
- **Storage**: Database with expiration timestamps
- **Cookies**: HttpOnly, Secure (production), SameSite=Lax
- **Expiration**: 7 days (configurable)
- **Tracking**: IP address and User-Agent

### Protection Against:
- **Brute force**: Upstash rate limiting
- **Timing attacks**: Constant-time password checks, artificial delays
- **XSS**: HttpOnly cookies
- **CSRF**: SameSite cookie attribute
- **Session fixation**: New token on each login
- **SQL injection**: Parameterized queries (when using prepared statements)

## API Reference

### Authentication Actions

#### `loginAction(formData)`
Server action for user login.

```typescript
const result = await loginAction(formData);
// Returns: { success: boolean, message: string }
```

#### `logoutAction()`
Server action for user logout.

```typescript
await logoutAction();
// Redirects to home page
```

#### `isAuthenticated()`
Check if user has valid session.

```typescript
const authenticated = await isAuthenticated();
if (!authenticated) redirect('/login');
```

#### `getUserSession()`
Get current user data.

```typescript
const user = await getUserSession();
if (user) {
  console.log(user.email, user.role);
}
```

### Database Functions

All database functions are in `lib/db/client.ts`:

- `findUserByEmail(email)` - Get user by email
- `findUserById(id)` - Get user by ID
- `createUser(userData)` - Register new user
- `createSession(userId, token, expiresAt, ip?, userAgent?)` - Create session
- `findSessionByToken(token)` - Get session
- `deleteSession(token)` - Delete specific session
- `deleteAllUserSessions(userId)` - Logout all devices
- `cleanupExpiredSessions()` - Remove old sessions
- `updateLastLogin(userId)` - Track login time
- `verifyUserEmail(userId)` - Mark email as verified

### Password Utilities

All password functions are in `lib/auth/password.ts`:

- `hashPassword(password)` - Hash plaintext password
- `verifyPassword(password, hash)` - Verify password
- `validatePasswordStrength(password)` - Check password requirements
- `needsRehash(hash)` - Check if hash should be updated
- `generateSecurePassword(length)` - Generate random password

### Rate Limiting

Rate limiting functions in `lib/auth/upstash-rate-limiter.ts`:

- `checkLoginRateLimit(identifier)` - Check and increment counter
- `resetRateLimit(identifier)` - Clear counter (admin use)
- `getRateLimitStatus(identifier)` - Check without incrementing
- `createCustomRateLimiter(max, window, prefix)` - Custom limits

## Migration from Demo

The production code is drop-in compatible with the demo. The system automatically falls back to development mode if database is not configured:

1. Demo code is preserved in comments at bottom of `auth.ts`
2. If `DATABASE_URL` not set, development mode activates
3. Development mode shows helpful error messages with setup instructions
4. Once configured, production code activates automatically

## Testing

### Test Authentication Flow

```bash
# 1. Start development server
npm run dev

# 2. Navigate to login page
# http://localhost:3000/login

# 3. Try invalid credentials (should fail)
# Email: test@example.com
# Password: wrong

# 4. Try valid credentials (if admin user created)
# Email: admin@example.com
# Password: YourSecurePassword123!

# 5. Verify session persists across page loads

# 6. Test logout functionality

# 7. Test rate limiting (try 6+ failed logins)
```

### Test Database Connection

```typescript
// test-db.ts
import { findUserByEmail } from '@/lib/db/client';

async function test() {
  try {
    const user = await findUserByEmail('admin@example.com');
    console.log('Database connected:', user ? 'User found' : 'User not found');
  } catch (error) {
    console.error('Database error:', error);
  }
}

test();
```

### Test Rate Limiting

```bash
# Use curl to test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

## Maintenance

### Session Cleanup

Set up cron job to clean expired sessions:

```bash
# crontab -e
0 2 * * * node /path/to/cleanup-sessions.js
```

```javascript
// cleanup-sessions.js
const { cleanupExpiredSessions } = require('./lib/db/client');

cleanupExpiredSessions()
  .then(count => console.log(`Cleaned ${count} sessions`))
  .catch(err => console.error('Cleanup failed:', err));
```

### Password Rehashing

If you increase `SALT_ROUNDS`, implement rehashing on login:

```typescript
// In loginAction after successful login
if (needsRehash(user.password_hash)) {
  const newHash = await hashPassword(password);
  await updateUserPassword(user.id, newHash);
}
```

### Monitoring

Monitor these metrics:
- Failed login attempts per hour
- Active sessions count
- Rate limit triggers
- Database query performance
- Session expiration rate

## Troubleshooting

### "Database not configured"
- Check `DATABASE_URL` in `.env.local`
- Verify database connection
- Run migrations from `lib/db/schema.sql`

### "Upstash rate limiter not configured"
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Verify Upstash account and database created
- System falls back to development mode (logs warning)

### "Invalid credentials" always returned
- Verify user exists in database
- Check password was hashed with bcrypt
- Ensure `password_hash` column is populated
- Test with known valid credentials

### Sessions expire immediately
- Check `expires_at` timestamp in database
- Verify timezone settings
- Ensure system clock is correct
- Check cookie `maxAge` configuration

### Rate limiting not working
- Verify Upstash Redis connection
- Check Redis console for key creation
- Test with multiple failed attempts
- Review rate limit window settings

## Security Best Practices

1. **Never log passwords** - Even hashed passwords should be handled carefully
2. **Use HTTPS in production** - Required for Secure cookies
3. **Rotate secrets regularly** - Update `AUTH_SECRET` periodically
4. **Monitor failed logins** - Set up alerts for suspicious activity
5. **Implement account lockout** - After repeated failures
6. **Add CAPTCHA** - For public-facing login pages
7. **Enable 2FA** - For sensitive accounts
8. **Regular security audits** - Review access logs and sessions
9. **Keep dependencies updated** - Run `npm audit` regularly
10. **Backup database** - Regular backups of user and session data

## Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Send verification email on registration
   - Use email_verification_tokens table
   - Block login until verified

2. **Password Reset**
   - Implement "forgot password" flow
   - Use password_reset_tokens table
   - Send reset link via email

3. **OAuth/SSO Integration**
   - Add Google/GitHub login
   - Use NextAuth.js or similar
   - Link social accounts to users

4. **Multi-Factor Authentication**
   - TOTP (Google Authenticator)
   - SMS verification
   - Backup codes

5. **Session Management UI**
   - Show active sessions
   - "Logout all devices" button
   - Display last login info

6. **Account Security**
   - Login history
   - Security notifications
   - Suspicious activity detection

7. **Advanced Rate Limiting**
   - IP-based limits
   - Progressive delays
   - Account-specific limits

## Support

- Documentation: `/docs/auth/`
- Database Schema: `/lib/db/schema.sql`
- Auth Implementation: `/app/@left/(_AUTH)/login/(_server)/actions/auth.ts`
- Issues: Create GitHub issue with `[auth]` tag

## License

Same as parent project (AIFA v2.1).
