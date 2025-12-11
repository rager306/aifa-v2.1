/**
 * Database Client
 *
 * Production database client for user authentication and session management.
 * Configure with PostgreSQL, Supabase, Vercel Postgres, or other SQL database.
 *
 * TODO: Implement with your chosen database:
 * - PostgreSQL with pg: https://node-postgres.com/
 * - Prisma ORM: https://www.prisma.io/
 * - Supabase: https://supabase.com/docs/reference/javascript
 * - Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
 */

/**
 * User interface matching database schema
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Session interface for authentication tokens
 */
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: Date;
}

/**
 * Create user data (for registration)
 */
export interface CreateUserData {
  email: string;
  password_hash: string;
  name?: string;
  role?: string;
}

/**
 * Database configuration check
 */
function checkDatabaseConfig(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not configured. " +
        "Please set up your database connection in .env.local"
    );
  }
}

/**
 * Find user by email address
 *
 * @param email - User's email address
 * @returns User object or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL (pg):
  // const result = await pool.query(
  //   'SELECT * FROM users WHERE email = $1',
  //   [email]
  // );
  // return result.rows[0] || null;

  // Example with Prisma:
  // return await prisma.user.findUnique({
  //   where: { email }
  // });

  // Example with Supabase:
  // const { data, error } = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('email', email)
  //   .single();
  // return data;

  throw new Error(
    "Database not configured. Please implement findUserByEmail() in lib/db/client.ts"
  );
}

/**
 * Find user by ID
 *
 * @param id - User's unique identifier
 * @returns User object or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  // return result.rows[0] || null;

  throw new Error(
    "Database not configured. Please implement findUserById() in lib/db/client.ts"
  );
}

/**
 * Create a new user
 *
 * @param userData - User data for registration
 * @returns Created user object
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // const result = await pool.query(
  //   'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
  //   [userData.email, userData.password_hash, userData.name, userData.role || 'user']
  // );
  // return result.rows[0];

  throw new Error(
    "Database not configured. Please implement createUser() in lib/db/client.ts"
  );
}

/**
 * Create a new session for authenticated user
 *
 * @param userId - User's unique identifier
 * @param token - Session token (UUID)
 * @param expiresAt - Session expiration timestamp
 * @param ipAddress - Optional IP address for security tracking
 * @param userAgent - Optional user agent for device tracking
 * @returns Created session object
 */
export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // const result = await pool.query(
  //   'INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
  //   [userId, token, expiresAt, ipAddress, userAgent]
  // );
  // return result.rows[0];

  throw new Error(
    "Database not configured. Please implement createSession() in lib/db/client.ts"
  );
}

/**
 * Find session by token
 *
 * @param token - Session token
 * @returns Session object or null if not found/expired
 */
export async function findSessionByToken(
  token: string
): Promise<Session | null> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // const result = await pool.query(
  //   'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
  //   [token]
  // );
  // return result.rows[0] || null;

  throw new Error(
    "Database not configured. Please implement findSessionByToken() in lib/db/client.ts"
  );
}

/**
 * Delete session (logout)
 *
 * @param token - Session token to delete
 */
export async function deleteSession(token: string): Promise<void> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // await pool.query('DELETE FROM sessions WHERE token = $1', [token]);

  throw new Error(
    "Database not configured. Please implement deleteSession() in lib/db/client.ts"
  );
}

/**
 * Delete all sessions for a user (logout all devices)
 *
 * @param userId - User's unique identifier
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);

  throw new Error(
    "Database not configured. Please implement deleteAllUserSessions() in lib/db/client.ts"
  );
}

/**
 * Cleanup expired sessions (run periodically)
 * Should be called via cron job or background task
 */
export async function cleanupExpiredSessions(): Promise<number> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // const result = await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  // return result.rowCount || 0;

  throw new Error(
    "Database not configured. Please implement cleanupExpiredSessions() in lib/db/client.ts"
  );
}

/**
 * Update user's last login timestamp
 *
 * @param userId - User's unique identifier
 */
export async function updateLastLogin(userId: string): Promise<void> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // await pool.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [userId]);

  // This is optional but useful for tracking user activity
  console.log(`User ${userId} logged in at ${new Date().toISOString()}`);
}

/**
 * Verify user's email address
 *
 * @param userId - User's unique identifier
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  checkDatabaseConfig();

  // TODO: Implement with your database
  // Example with PostgreSQL:
  // await pool.query(
  //   'UPDATE users SET email_verified = true WHERE id = $1',
  //   [userId]
  // );

  throw new Error(
    "Database not configured. Please implement verifyUserEmail() in lib/db/client.ts"
  );
}
