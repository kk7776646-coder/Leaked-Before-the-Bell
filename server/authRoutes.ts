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

// Seed initial system accounts on startup
seedDefaultUsersIfEmpty();

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
 * Real user account registration with validation and safe default OPERATOR role
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, organization } = req.body;

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

    // Provision new user with safe default OPERATOR role
    const newUser: UserRecord = {
      id: `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      email: normalizedEmail,
      fullName: fullName.trim(),
      passwordHash: hashPassword(password),
      role: 'OPERATOR', // Safe default role
      organization: organization ? organization.trim() : undefined,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Create session
    const session = createSession(
      newUser.id,
      false,
      req.headers['user-agent'],
      req.ip || (req.headers['x-forwarded-for'] as string)
    );

    setSessionCookie(res, session.token, false);

    db.logAudit(
      'ACCOUNT_CREATED',
      'USER_ACCOUNT',
      newUser.id,
      'SUCCESS',
      `User ${newUser.email} created an account with role ${newUser.role}.`
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: toSafeUser(newUser),
      token: session.token,
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
