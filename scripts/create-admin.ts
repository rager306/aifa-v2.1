/**
 * Create Admin User Script
 *
 * Creates an admin user account with hashed password.
 * Run once after setting up the database.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * You will be prompted for:
 * - Email address
 * - Password (must meet strength requirements)
 * - Name (optional)
 */

import { hashPassword } from '../lib/auth/password';
import { createUser } from '../lib/db/client';
import * as readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n=== Create Admin User ===\n');

  try {
    // Get email
    const email = await question('Email address: ');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('Invalid email address');
      rl.close();
      process.exit(1);
    }

    // Get password
    const password = await question(
      'Password (min 8 chars, uppercase, lowercase, number, special char): '
    );

    // Validate password (basic check)
    if (!password || password.length < 8) {
      console.error('Password must be at least 8 characters long');
      rl.close();
      process.exit(1);
    }

    // Get name (optional)
    const name = await question('Name (optional): ');

    console.log('\nCreating admin user...');

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const admin = await createUser({
      email,
      password_hash: passwordHash,
      name: name || 'Admin User',
      role: 'admin',
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\nYou can now login with these credentials.');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);

    if (error instanceof Error) {
      if (error.message.includes('Database not configured')) {
        console.log('\nPlease configure DATABASE_URL in .env.local');
        console.log('See docs/auth/PRODUCTION-AUTH.md for setup instructions');
      } else if (error.message.includes('duplicate key')) {
        console.log('\nUser with this email already exists');
      }
    }

    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdmin();
