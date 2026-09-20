import crypto from 'crypto';
import { db } from './db';
import { UserRecord, SafeUser, SessionRecord, UserRole } from './types';

// ==========================================
// CRYPTO CONFIGURATION & PASSWORD HASHING
// ==========================================

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64,
};

/**
 * Derives a secure password hash using scrypt KDF with cryptographically random salt.
 * Formatted string: scrypt$N$r$p$saltHex$hashHex
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Validates a password against stored scrypt hash using timingSafeEqual to prevent side-channel leaks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') {
      return false;
    }

    const N = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = parts[4];
    const key = parts[5];

    const targetBuf = Buffer.from(key, 'hex');
    const derivedBuf = crypto.scryptSync(password, salt, targetBuf.length, { N, r, p });

    return crypto.timingSafeEqual(targetBuf, derivedBuf);
  } catch {
    return false;
  }
}

/**
 * Enforces LeakLens secure password policy:
 * - At least 8 characters
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 lowercase letter
 * - Contains at least 1 number
 */
export function validatePasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

/**
 * Validates standard email structure
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Strips sensitive fields like passwordHash before exposing to frontend
 */
export function toSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    organization: user.organization,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Session creation: 32 bytes cryptographically secure random token (64 hex characters)
 * 7-day default duration or 30 days if rememberMe
 */
export function createSession(userId: string, rememberMe = false, userAgent?: string, ip?: string): SessionRecord {
  const token = crypto.randomBytes(32).toString('hex');
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  const session: SessionRecord = {
    token,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
    userAgent,
    ip,
  };

  db.createSession(session);
  return session;
}

/**
 * Retrieves valid session and associated safe user, returning null if invalid or expired.
 */
export function getAuthenticatedUserFromToken(token: string): { user: SafeUser; session: SessionRecord } | null {
  if (!token || typeof token !== 'string') return null;

  const session = db.getSession(token);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    db.deleteSession(token);
    return null;
  }

  const user = db.getUserById(session.userId);
  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return {
    user: toSafeUser(user),
    session,
  };
}

/**
 * Seeds default security accounts if no user exists in database
 */
export function seedDefaultUsersIfEmpty(): void {
  const users = db.getUsers();
  const rawBootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  
  if (rawBootstrapEmail && rawBootstrapEmail.trim().length > 0) {
    const bootstrapEmail = rawBootstrapEmail.trim().toLowerCase();
    const bootstrapExists = users.some((u) => u.email.trim().toLowerCase() === bootstrapEmail);
    
    if (!bootstrapExists) {
      let adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
      let isRandom = false;

      if (!adminPassword || adminPassword.trim().length === 0) {
        adminPassword = crypto.randomBytes(10).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 'A1!';
        isRandom = true;
      }

      const bootstrapAdmin: UserRecord = {
        id: `USR-ADM-${Date.now().toString(36).toUpperCase()}`,
        email: bootstrapEmail,
        fullName: 'Chief Examination Controller',
        passwordHash: hashPassword(adminPassword),
        role: 'ADMIN',
        organization: 'Central Examination Oversight Board',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      db.createUser(bootstrapAdmin);
      console.log(`[BOOTSTRAP] Configured BOOTSTRAP_ADMIN_EMAIL: ${bootstrapEmail} created successfully.`);

      if (isRandom) {
        console.log(`\n======================================================================`);
        console.log(`[BOOTSTRAP] SECURE ADMIN ACCOUNT GENERATED`);
        console.log(`Email: ${bootstrapEmail}`);
        console.log(`Temporary Password: ${adminPassword}`);
        console.log(`======================================================================\n`);
      }
    } else {
      console.log(`[BOOTSTRAP] Configured BOOTSTRAP_ADMIN_EMAIL: ${bootstrapEmail} already exists. Preserving credentials.`);
    }
  } else {
    // If no custom BOOTSTRAP_ADMIN_EMAIL is configured, fall back to checking if any ADMIN exists
    const adminExists = users.some((u) => u.role === 'ADMIN');
    if (!adminExists) {
      const adminEmail = 'admin@leaklens.local';
      const defaultAdmin: UserRecord = {
        id: `USR-ADM-${Date.now().toString(36).toUpperCase()}`,
        email: adminEmail,
        fullName: 'Chief Examination Controller',
        passwordHash: hashPassword('Admin123!'),
        role: 'ADMIN',
        organization: 'Central Examination Oversight Board',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      db.createUser(defaultAdmin);
      console.log('[Auth] Seeded default system admin: admin@leaklens.local');
    }
  }

  // Seed default security officer ONLY if no officer exists
  const officerExists = users.some((u) => u.role === 'SECURITY_OFFICER');
  if (!officerExists) {
    const defaultOfficer: UserRecord = {
      id: 'USR-SEC-001',
      email: 'security.officer@leaklens.local',
      fullName: 'Exam Operations',
      passwordHash: hashPassword('Password123!'),
      role: 'SECURITY_OFFICER',
      organization: 'State Examination Security Operations',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.createUser(defaultOfficer);
    console.log('[Auth] Seeded default security officer: security.officer@leaklens.local');
  }
}
