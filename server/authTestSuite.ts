import { db } from './db';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  createSession,
  getAuthenticatedUserFromToken,
} from './auth';
import { UserRecord, UserRole, UserStatus } from './types';

export interface AuthTestScenarioResult {
  id: string;
  name: string;
  category: 'LOGIN' | 'POLICY' | 'STATUS_ENFORCEMENT' | 'ROLE_AUTHORIZATION' | 'SESSION_LIFECYCLE';
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details: string;
}

export interface AuthTestSuiteReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  summary: string;
  timestamp: string;
  results: AuthTestScenarioResult[];
}

export async function runAllAuthTests(): Promise<AuthTestSuiteReport> {
  const results: AuthTestScenarioResult[] = [];
  const startSuiteTime = Date.now();

  const runScenario = async (
    id: string,
    name: string,
    category: AuthTestScenarioResult['category'],
    fn: () => void | Promise<void>
  ) => {
    const startTime = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        category,
        status: 'PASSED',
        durationMs: Date.now() - startTime,
        details: 'Scenario completed successfully.',
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        category,
        status: 'FAILED',
        durationMs: Date.now() - startTime,
        details: err.message || 'Unknown error occurred.',
      });
    }
  };

  // Setup mock database state
  const originalUsers = [...db.getUsers()];
  const originalSessions = [...(db['data'].sessions || [])];

  try {
    // SCENARIO 1: Password Policy Validation
    await runScenario('AUTH-POL-001', 'Password Complexity Validation', 'POLICY', () => {
      const valid = validatePasswordPolicy('SecurePass123!');
      if (!valid.valid) throw new Error('Policy incorrectly rejected a valid password');

      const missingNumber = validatePasswordPolicy('NoNumbersPass!');
      if (missingNumber.valid) throw new Error('Policy accepted password missing numeric character');

      const tooShort = validatePasswordPolicy('Ab1!');
      if (tooShort.valid) throw new Error('Policy accepted password shorter than minimum requirements');
    });

    // SCENARIO 2: Password Hashing & Verification
    await runScenario('AUTH-LOG-001', 'Password Hashing and Match Verification', 'LOGIN', () => {
      const plainPassword = 'CorrectHorseBatteryStaple1!';
      const hash = hashPassword(plainPassword);
      
      const match = verifyPassword(plainPassword, hash);
      if (!match) throw new Error('Failed to verify a correct password');

      const mismatch = verifyPassword('WrongPassword1!', hash);
      if (mismatch) throw new Error('Incorrectly verified a mismatched password');
    });

    // SCENARIO 3: Create User and Valid Login/Session Flow
    await runScenario('AUTH-SES-001', 'Valid Session Lifecycle Flow', 'SESSION_LIFECYCLE', () => {
      const testEmail = 'test.user@leaklens.test';
      const password = 'TestUser123!';
      
      const user: UserRecord = {
        id: 'USR-TST-001',
        email: testEmail,
        fullName: 'Test User',
        passwordHash: hashPassword(password),
        role: 'OPERATOR',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      db.createUser(user);

      // Verify user created
      const found = db.getUserByEmail(testEmail);
      if (!found) throw new Error('Failed to retrieve created user from database');

      // Create session
      const session = createSession(user.id, false, 'Node-Test-Suite', '127.0.0.1');
      if (!session || !session.token) throw new Error('Failed to create a valid session token');

      // Verify session authentication
      const authData = getAuthenticatedUserFromToken(session.token);
      if (!authData) throw new Error('Failed to authenticate valid session token');
      if (authData.user.id !== user.id) throw new Error('Authenticated user ID does not match expected ID');
    });

    // SCENARIO 4: Disabled and Suspended Status Enforcement
    await runScenario('AUTH-STT-001', 'Enforcement of Disabled/Suspended Status', 'STATUS_ENFORCEMENT', () => {
      const disabledEmail = 'disabled.user@leaklens.test';
      const user: UserRecord = {
        id: 'USR-TST-002',
        email: disabledEmail,
        fullName: 'Disabled User',
        passwordHash: hashPassword('Disabled123!'),
        role: 'OPERATOR',
        status: 'DISABLED',
        createdAt: new Date().toISOString(),
      };

      db.createUser(user);

      // Create active session
      const session = createSession(user.id, false, 'Node-Test', '127.0.0.1');
      
      // Verification must fail because user status is NOT 'ACTIVE'
      const authData = getAuthenticatedUserFromToken(session.token);
      if (authData !== null) {
        throw new Error('A user with status DISABLED was allowed to authenticate via active session');
      }
    });

    // SCENARIO 5: Active Session Revocation on User Lockout
    await runScenario('AUTH-SES-002', 'Session Revocation on Disabling User', 'STATUS_ENFORCEMENT', () => {
      const email = 'revocation.user@leaklens.test';
      const user: UserRecord = {
        id: 'USR-TST-003',
        email,
        fullName: 'Revocation User',
        passwordHash: hashPassword('RevokeMe123!'),
        role: 'OPERATOR',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      db.createUser(user);

      // Create session
      const session = createSession(user.id, false, 'Node-Test', '127.0.0.1');
      const beforeAuth = getAuthenticatedUserFromToken(session.token);
      if (!beforeAuth) throw new Error('User was not authenticated initially while active');

      // Now update status to DISABLED and revoke sessions
      db.updateUser(user.id, { status: 'DISABLED' });
      db.deleteUserSessions(user.id);

      // Verify that session is completely deleted
      const afterAuth = getAuthenticatedUserFromToken(session.token);
      if (afterAuth !== null) {
        throw new Error('User session remained valid after explicit session revocation');
      }
    });

  } finally {
    // Tear down test data, restore original database state
    db['data'].users = originalUsers;
    db['data'].sessions = originalSessions;
    db.save();
  }

  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  const failedCount = results.length - passedCount;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    summary: `Authentication & authorization test suite completed: ${passedCount}/${results.length} passed.`,
    timestamp: new Date().toISOString(),
    results,
  };
}
