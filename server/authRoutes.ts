import express, { Request, Response, NextFunction } from 'express';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  validateEmail,
  toSafeUser,
  createSession,
  getAuthenticatedUserFromToken,
  seedDefaultUsersIfEmpty,
} from './auth';
import { db } from './db';
import { SafeUser, SessionRecord, UserRecord } from './types';

// Extend Express Request interface to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionRecord?: SessionRecord;
      sessionToken?: string;
    }
  }
}

export const authRouter = express.Router();

// Seed initial system accounts on startup once database is hydrated
db.onSynced(() => {
  seedDefaultUsersIfEmpty();
});

/**
 * Authentication extraction middleware
 * Inspects both HttpOnly cookies and Bearer token headers for maximum compatibility
 */
export function extractAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined = undefined;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.leaklens_session) {
    token = req.cookies.leaklens_session;
  }

  // 2. Check Authorization header fallback
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (token) {
    req.sessionToken = token;
    const authData = getAuthenticatedUserFromToken(token);
    if (authData) {
      req.user = authData.user;
      req.sessionRecord = authData.session;
    }
  }

  next();
}

/**
 * Guard middleware for endpoints requiring valid authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }
  next();
}

/**
 * Guard middleware for endpoints requiring specific user roles
 */
export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this resource.',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have the required permissions to perform this action.',
      });
    }
    next();
  };
}

/**
 * Helper to set standard HttpOnly session cookie
 */
function setSessionCookie(res: Response, token: string, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  res.cookie('leaklens_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/**
 * POST /api/auth/register
 * Real user account registration with validation and safe default OPERATOR role.
 * Secured to require ADMIN authentication.
 */
authRouter.post('/register', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, organization, role } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = db.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Password policy check
    const policyResult = validatePasswordPolicy(password);
    if (!policyResult.valid) {
      return res.status(400).json({
        success: false,
        message: policyResult.error || 'Password does not meet complexity requirements.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const validRoles = ['OPERATOR', 'SECURITY_OFFICER', 'ADMIN', 'REVIEWER', 'VIEWER'];
    const assignedRole = role && validRoles.includes(role) ? role : 'OPERATOR';

    // Provision new user
    const newUser: UserRecord = {
      id: `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      email: normalizedEmail,
      fullName: fullName.trim(),
      passwordHash: hashPassword(password),
      role: assignedRole,
      organization: organization ? organization.trim() : undefined,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    db.logAudit(
      'ACCOUNT_CREATED',
      'USER_ACCOUNT',
      newUser.id,
      'SUCCESS',
      `User ${newUser.email} created by Admin ${req.user?.email || 'System'} with role ${newUser.role}.`
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: toSafeUser(newUser),
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during account creation. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * Real password verification, session creation, and secure cookie issuance
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.getUserByEmail(normalizedEmail);

    // Generic error message to prevent user enumeration
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is currently suspended. Please contact your system administrator.',
      });
    }

    // Update last login timestamp
    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    // Create new session
    const session = createSession(
      user.id,
      !!rememberMe,
      req.headers['user-agent'],
      req.ip || (req.headers['x-forwarded-for'] as string)
    );

    setSessionCookie(res, session.token, !!rememberMe);

    db.logAudit(
      'USER_LOGIN',
      'USER_SESSION',
      user.id,
      'SUCCESS',
      `User ${user.email} signed in successfully (${user.role}).`
    );

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      user: toSafeUser(user),
      token: session.token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected authentication error occurred.',
    });
  }
});

/**
 * POST /api/auth/logout
 * Destroys session on backend and clears client cookie
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    let token = req.sessionToken;
    if (!token && req.cookies && req.cookies.leaklens_session) {
      token = req.cookies.leaklens_session;
    }
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (token) {
      db.deleteSession(token);
    }

    res.clearCookie('leaklens_session', { path: '/' });

    if (req.user) {
      db.logAudit(
        'USER_LOGOUT',
        'USER_SESSION',
        req.user.id,
        'SUCCESS',
        `User ${req.user.email} signed out.`
      );
    }

    return res.json({
      success: true,
      message: 'Signed out successfully.',
    });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.clearCookie('leaklens_session', { path: '/' });
    return res.json({ success: true, message: 'Signed out.' });
  }
});

/**
 * GET /api/auth/session
 * Returns current authenticated state
 */
authRouter.get('/session', (req: Request, res: Response) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }
  return res.json({
    authenticated: false,
    user: null,
  });
});

/**
 * GET /api/users/me
 * Returns profile of current authenticated user
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/**
 * POST /api/auth/forgot-password
 * Neutral password reset dispatch
 */
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  const user = db.getUserByEmail(email.trim().toLowerCase());
  if (user) {
    db.logAudit(
      'PASSWORD_RESET_REQUESTED',
      'USER_ACCOUNT',
      user.id,
      'SUCCESS',
      `Password reset requested for ${user.email}.`
    );
  }

  // Neutral message preventing email enumeration
  return res.json({
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been dispatched.',
  });
});

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

/**
 * GET /api/auth/users
 * Retrieves all user records in the system (safely mapped)
 */
authRouter.get('/users', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const users = db.getUsers().map(u => toSafeUser(u));
    return res.json({
      success: true,
      users,
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users list.',
    });
  }
});

/**
 * POST /api/auth/users
 * Explicit endpoint for Admin to provision a new user directly
 */
authRouter.post('/users', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role, organization } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, and role are required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const policyResult = validatePasswordPolicy(password);
    if (!policyResult.valid) {
      return res.status(400).json({
        success: false,
        message: policyResult.error || 'Password does not meet complexity requirements.',
      });
    }

    const validRoles = ['OPERATOR', 'SECURITY_OFFICER', 'ADMIN', 'REVIEWER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const newUser: UserRecord = {
      id: `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      email: normalizedEmail,
      fullName: fullName.trim(),
      passwordHash: hashPassword(password),
      role: role as any,
      organization: organization ? organization.trim() : undefined,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    db.logAudit(
      'USER_CREATED',
      'USER_ACCOUNT',
      newUser.id,
      'SUCCESS',
      `Admin ${req.user?.email} created user ${newUser.email} with role ${newUser.role}.`
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: toSafeUser(newUser),
    });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
    });
  }
});

/**
 * PUT /api/auth/users/:id
 * Admin endpoint to update any user's profile, role, status, or set a new password
 */
authRouter.put('/users/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;
    const targetUser = db.getUserById(targetId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Admins shouldn't be able to disable/suspend themselves to prevent lockout
    if (targetId === req.user?.id && req.body.status && req.body.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Lockout prevention: You cannot disable or suspend your own admin account.',
      });
    }

    const updates: Partial<UserRecord> = {};
    const auditDetails: string[] = [];

    // 1. Update general info
    if (req.body.fullName !== undefined) {
      updates.fullName = req.body.fullName.trim();
    }
    if (req.body.organization !== undefined) {
      updates.organization = req.body.organization.trim() || undefined;
    }

    // 2. Update email (with duplicate checks)
    if (req.body.email !== undefined && req.body.email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const newEmail = req.body.email.trim().toLowerCase();
      if (!validateEmail(newEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }
      const existing = db.getUserByEmail(newEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      updates.email = newEmail;
      auditDetails.push(`email changed from ${targetUser.email} to ${newEmail}`);
    }

    // 3. Update role
    if (req.body.role !== undefined && req.body.role !== targetUser.role) {
      const validRoles = ['OPERATOR', 'SECURITY_OFFICER', 'ADMIN', 'REVIEWER', 'VIEWER'];
      if (!validRoles.includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified.',
        });
      }
      updates.role = req.body.role;
      auditDetails.push(`role changed from ${targetUser.role} to ${req.body.role}`);

      db.logAudit(
        'ROLE_CHANGED',
        'USER_ACCOUNT',
        targetId,
        'SUCCESS',
        `Admin ${req.user?.email} changed role of ${targetUser.email} from ${targetUser.role} to ${req.body.role}.`
      );
    }

    // 4. Update status (with session revocation on disabling/suspending)
    let shouldRevokeSessions = false;
    if (req.body.status !== undefined && req.body.status !== targetUser.status) {
      const validStatuses = ['ACTIVE', 'SUSPENDED', 'DISABLED'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status specified.',
        });
      }
      updates.status = req.body.status;
      auditDetails.push(`status changed from ${targetUser.status} to ${req.body.status}`);

      if (req.body.status !== 'ACTIVE') {
        shouldRevokeSessions = true;
      }

      db.logAudit(
        req.body.status === 'ACTIVE' ? 'USER_ENABLED' : 'USER_DISABLED',
        'USER_ACCOUNT',
        targetId,
        'SUCCESS',
        `Admin ${req.user?.email} updated status of ${targetUser.email} to ${req.body.status}.`
      );
    }

    // 5. Reset/Set password
    if (req.body.password !== undefined && req.body.password.trim().length > 0) {
      const policyResult = validatePasswordPolicy(req.body.password);
      if (!policyResult.valid) {
        return res.status(400).json({
          success: false,
          message: policyResult.error || 'Password does not meet complexity requirements.',
        });
      }
      updates.passwordHash = hashPassword(req.body.password);
      auditDetails.push('password reset');
      shouldRevokeSessions = true; // Force re-login on password change

      db.logAudit(
        'PASSWORD_RESET',
        'USER_ACCOUNT',
        targetId,
        'SUCCESS',
        `Admin ${req.user?.email} reset password for ${targetUser.email}.`
      );
    }

    const updatedUser = db.updateUser(targetId, updates);

    if (shouldRevokeSessions) {
      db.deleteUserSessions(targetId);
      db.logAudit(
        'SESSION_REVOCATION',
        'USER_SESSION',
        targetId,
        'SUCCESS',
        `Revoked all active sessions for ${targetUser.email} (triggered by account disable/password reset).`
      );
    }

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser ? toSafeUser(updatedUser) : null,
      sessionsRevoked: shouldRevokeSessions,
    });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user details.',
    });
  }
});

/**
 * POST /api/auth/users/:id/revoke-sessions
 * Explicitly revoke all active sessions for a user
 */
authRouter.post('/users/:id/revoke-sessions', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;
    const targetUser = db.getUserById(targetId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    db.deleteUserSessions(targetId);

    db.logAudit(
      'SESSION_REVOCATION',
      'USER_SESSION',
      targetId,
      'SUCCESS',
      `Admin ${req.user?.email} explicitly revoked all active sessions for ${targetUser.email}.`
    );

    return res.json({
      success: true,
      message: `Successfully revoked all active sessions for ${targetUser.fullName}.`,
    });
  } catch (err: any) {
    console.error('Error revoking sessions:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke user sessions.',
    });
  }
});
