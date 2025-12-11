/**
 * Cleanup Expired Sessions Script
 *
 * Removes expired sessions from the database.
 * Should be run periodically via cron job.
 *
 * Usage:
 *   npx tsx scripts/cleanup-sessions.ts
 *
 * Cron job example (runs daily at 2 AM):
 *   0 2 * * * cd /path/to/project && npx tsx scripts/cleanup-sessions.ts
 */

import { cleanupExpiredSessions } from '../lib/db/client';

async function cleanup() {
  console.log('Starting session cleanup...');

  try {
    const count = await cleanupExpiredSessions();
    console.log(`✅ Cleaned up ${count} expired sessions`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Session cleanup failed:', error);

    if (error instanceof Error && error.message.includes('Database not configured')) {
      console.log('\nPlease configure DATABASE_URL in .env.local');
      console.log('See docs/auth/PRODUCTION-AUTH.md for setup instructions');
    }

    process.exit(1);
  }
}

// Run the cleanup
cleanup();
