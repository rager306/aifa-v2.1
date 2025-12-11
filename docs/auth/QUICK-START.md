# Authentication Quick Start

Get production authentication running in 5 minutes.

## 1. Install Dependencies ✅

Already installed:
- `bcrypt` - Password hashing
- `@upstash/ratelimit` - Rate limiting
- `@upstash/redis` - Redis client
- `@types/bcrypt` - TypeScript types

## 2. Set Up Database (Choose One)

### Option A: Supabase (Easiest)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy `lib/db/schema.sql` into SQL Editor
4. Run the SQL
5. Get connection string from Settings → Database

```bash
# Add to .env.local
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql@15  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb aifa_auth

# Run migrations
psql aifa_auth -f lib/db/schema.sql

# Add to .env.local
DATABASE_URL="postgresql://localhost:5432/aifa_auth"
```

## 3. Set Up Upstash Redis

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST credentials

```bash
# Add to .env.local
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

## 4. Create Admin User

```bash
npx tsx scripts/create-admin.ts
# Follow prompts to enter email/password
```

## 5. Test Authentication

```bash
npm run dev
# Navigate to http://localhost:3000/login
# Login with admin credentials
```

## That's It!

Your production authentication is ready.

## What's Included

- ✅ bcrypt password hashing (12 rounds)
- ✅ Upstash Redis rate limiting (5 attempts/15min)
- ✅ Database-backed sessions (7-day expiry)
- ✅ Secure cookies (HttpOnly, Secure, SameSite)
- ✅ IP and User-Agent tracking
- ✅ Development mode fallback

## File Structure

```
lib/
├── auth/
│   ├── password.ts              # Password hashing utilities
│   └── upstash-rate-limiter.ts  # Rate limiting
├── db/
│   ├── schema.sql               # Database migrations
│   └── client.ts                # Database client
app/@left/(_AUTH)/login/(_server)/actions/
└── auth.ts                      # Production auth logic
scripts/
├── create-admin.ts              # Create admin user
└── cleanup-sessions.ts          # Session cleanup
docs/auth/
├── PRODUCTION-AUTH.md           # Full documentation
├── DATABASE-SETUP.md            # Database guide
└── QUICK-START.md               # This file
```

## Next Steps

- [Full Documentation](./PRODUCTION-AUTH.md)
- [Database Setup Guide](./DATABASE-SETUP.md)
- [Add Email Verification](./PRODUCTION-AUTH.md#email-verification)
- [Add Password Reset](./PRODUCTION-AUTH.md#password-reset)
- [Add OAuth/SSO](./PRODUCTION-AUTH.md#oauthsso-integration)

## Troubleshooting

### "Database not configured"

Check `.env.local` has `DATABASE_URL` and database is running.

### "Rate limiter not configured"

Check `.env.local` has Upstash credentials. System will work but won't rate limit.

### "Invalid credentials"

Ensure admin user was created successfully with `scripts/create-admin.ts`.

## Support

- Issues: Create GitHub issue with `[auth]` tag
- Docs: See `docs/auth/PRODUCTION-AUTH.md`
- Schema: See `lib/db/schema.sql`
