# Database Setup Guide

Step-by-step guide for setting up your authentication database.

## Prerequisites

- Node.js 18+ installed
- Database provider account (see options below)
- Terminal/command line access

## Option 1: Supabase (Recommended)

Supabase provides a free tier with PostgreSQL database and includes helpful UI tools.

### Steps

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub, Google, or email

2. **Create New Project**
   - Click "New Project"
   - Enter project details:
     - Name: `aifa-auth`
     - Database password: (save this!)
     - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

3. **Run Database Migrations**
   - Click "SQL Editor" in sidebar
   - Click "New query"
   - Open `/root/aifa-v2.1/lib/db/schema.sql`
   - Copy entire contents
   - Paste into Supabase SQL editor
   - Click "Run" button
   - Verify tables created under "Table Editor"

4. **Get Connection String**
   - Click "Settings" (gear icon)
   - Click "Database"
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy connection string
   - Replace `[YOUR-PASSWORD]` with your database password

5. **Configure Environment**
   ```bash
   # Edit .env.local
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

6. **Test Connection**
   ```bash
   # Create test user
   npx tsx scripts/create-admin.ts
   ```

### Supabase Features

- Free tier: 500MB database, 2GB bandwidth
- Auto-backups (paid plans)
- Real-time subscriptions
- Built-in authentication (optional, we're using custom)
- API auto-generation
- Dashboard for data management

## Option 2: Vercel Postgres

Best if you're deploying on Vercel.

### Steps

1. **Create Database**
   - Go to [vercel.com](https://vercel.com)
   - Select your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose region
   - Click "Create"

2. **Get Connection String**
   - Database created
   - Copy `POSTGRES_URL` from environment variables
   - Automatically added to your project

3. **Run Migrations**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Connect to database
   vercel env pull .env.local

   # Run migrations (use psql or GUI client)
   psql "$POSTGRES_URL" -f lib/db/schema.sql
   ```

4. **Create Admin User**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

### Vercel Postgres Features

- Seamless Vercel integration
- Auto-scaling
- Pay-as-you-go pricing
- Edge caching
- Connection pooling

## Option 3: Neon

Serverless PostgreSQL with generous free tier.

### Steps

1. **Create Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email
   - Click "Create a project"

2. **Create Project**
   - Name: `aifa-auth`
   - Region: Choose closest to users
   - PostgreSQL version: Latest (15+)
   - Click "Create project"

3. **Get Connection String**
   - Copy connection string shown
   - Or find in "Connection Details"
   - Format: `postgresql://user:password@host/database`

4. **Run Migrations**
   ```bash
   # Add to .env.local
   DATABASE_URL="your-neon-connection-string"

   # Run migrations
   psql "$DATABASE_URL" -f lib/db/schema.sql
   ```

5. **Create Admin**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

### Neon Features

- Serverless (scales to zero)
- Free tier: 3GB storage, 100 hours compute
- Instant branching (great for dev/staging)
- Point-in-time recovery
- Auto-suspend when idle

## Option 4: Railway

Simple deployment platform with PostgreSQL.

### Steps

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"

2. **Add PostgreSQL**
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Click "Add PostgreSQL"

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "PostgreSQL Connection URL"

4. **Run Migrations**
   ```bash
   # Add to .env.local
   DATABASE_URL="your-railway-connection-string"

   # Install psql or use Railway's built-in query tool
   # In Railway dashboard:
   # - Click PostgreSQL service
   # - Go to "Query" tab
   # - Paste schema.sql contents
   # - Click "Run"
   ```

5. **Create Admin**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

### Railway Features

- Simple UI
- Hobby plan: $5 credit/month
- Auto-deployment
- Environment variables sync
- Built-in metrics

## Option 5: Local PostgreSQL

For development and testing.

### Steps

1. **Install PostgreSQL**

   **macOS (Homebrew)**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

   **Ubuntu/Debian**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

   **Windows**
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Run installer
   - Use default port 5432

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # In psql:
   CREATE DATABASE aifa_auth;
   CREATE USER aifa_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE aifa_auth TO aifa_user;
   \q
   ```

3. **Run Migrations**
   ```bash
   # Add to .env.local
   DATABASE_URL="postgresql://aifa_user:your_password@localhost:5432/aifa_auth"

   # Run migrations
   psql -U aifa_user -d aifa_auth -f lib/db/schema.sql
   ```

4. **Create Admin**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

### Local Development Tips

- Use Docker for consistent environments:
  ```bash
  docker run --name aifa-postgres \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -e POSTGRES_DB=aifa_auth \
    -p 5432:5432 \
    -d postgres:15
  ```

- Use pgAdmin or TablePlus for GUI management
- Backup regularly: `pg_dump aifa_auth > backup.sql`

## Verification

After setup, verify everything works:

1. **Check Database Connection**
   ```bash
   # Should connect without errors
   psql "$DATABASE_URL" -c "SELECT version();"
   ```

2. **Verify Tables Created**
   ```bash
   psql "$DATABASE_URL" -c "\dt"
   ```

   Should show:
   - users
   - sessions
   - password_reset_tokens
   - email_verification_tokens

3. **Create Admin User**
   ```bash
   npx tsx scripts/create-admin.ts
   ```

4. **Test Authentication**
   - Start dev server: `npm run dev`
   - Navigate to `/login`
   - Login with admin credentials
   - Should redirect to home page

## Database Management

### GUI Tools

**TablePlus** (Recommended)
- Download: [tableplus.com](https://tableplus.com)
- Supports all databases
- Beautiful UI
- Free tier available

**pgAdmin**
- Download: [pgadmin.org](https://www.pgadmin.org)
- Official PostgreSQL tool
- Feature-rich
- Free and open source

**DBeaver**
- Download: [dbeaver.io](https://dbeaver.io)
- Universal database tool
- Free and open source

### Command Line

```bash
# Connect to database
psql "$DATABASE_URL"

# List tables
\dt

# View table structure
\d users

# Query users
SELECT id, email, role FROM users;

# View sessions
SELECT id, user_id, expires_at FROM sessions;

# Cleanup expired sessions
DELETE FROM sessions WHERE expires_at < NOW();
```

## Backup and Restore

### Backup

```bash
# Backup entire database
pg_dump "$DATABASE_URL" > backup.sql

# Backup specific tables
pg_dump "$DATABASE_URL" -t users -t sessions > users_backup.sql

# Backup with compression
pg_dump "$DATABASE_URL" | gzip > backup.sql.gz
```

### Restore

```bash
# Restore from backup
psql "$DATABASE_URL" < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```

## Troubleshooting

### "Database not configured" error

- Check `DATABASE_URL` in `.env.local`
- Verify format: `postgresql://user:password@host:port/database`
- Ensure database server is running
- Test connection: `psql "$DATABASE_URL" -c "SELECT 1;"`

### Connection timeout

- Check firewall settings
- Verify host and port
- Ensure database server accepts remote connections
- For cloud databases, check IP whitelist

### SSL/TLS errors

- Add `?sslmode=require` to connection string
- Or `?sslmode=disable` for local development
- Example: `postgresql://user:pass@host/db?sslmode=require`

### Permission denied

- Verify user has necessary privileges
- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE dbname TO username;`
- Check role membership: `\du` in psql

### Migrations failed

- Check for syntax errors in schema.sql
- Verify PostgreSQL version compatibility (needs 12+)
- Drop and recreate database if needed:
  ```bash
  dropdb database_name
  createdb database_name
  psql database_name -f lib/db/schema.sql
  ```

## Next Steps

After database setup:

1. ✅ Configure Upstash Redis for rate limiting
2. ✅ Create admin user
3. ✅ Test login flow
4. ✅ Set up session cleanup cron job
5. ✅ Configure backup strategy

See [PRODUCTION-AUTH.md](./PRODUCTION-AUTH.md) for complete authentication setup.
