import { db } from './db';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  createSession,
  getAuthenticatedUserFromToken,
  seedDefaultUsersIfEmpty,
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

    // SCENARIO 6: Bootstrap Admin - Brand New Provisioning with Password Policy and Hashing
    await runScenario('AUTH-BST-001', 'Admin Account Bootstrapping on First Startup', 'STATUS_ENFORCEMENT', () => {
      // Temporarily mock environment variables
      const originalEnvEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
      const originalEnvPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

      process.env.BOOTSTRAP_ADMIN_EMAIL = 'TestBootstrapAdmin@leaklens.test';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'BootstrapPass123!';

      try {
        // Clear database user roster
        db['data'].users = [];
        seedDefaultUsersIfEmpty();

        const users = db.getUsers();
        const createdAdmin = users.find((u) => u.email === 'testbootstrapadmin@leaklens.test');
        
        if (!createdAdmin) {
          throw new Error('Bootstrap did not create the configured admin account');
        }
        if (createdAdmin.role !== 'ADMIN') {
          throw new Error(`Bootstrapped user has role ${createdAdmin.role}, expected ADMIN`);
        }
        if (createdAdmin.status !== 'ACTIVE') {
          throw new Error(`Bootstrapped user has status ${createdAdmin.status}, expected ACTIVE`);
        }
        if (!createdAdmin.passwordHash) {
          throw new Error('Bootstrapped admin account has no password hash');
        }

        // Verify login works with the bootstrapped credentials
        const loginSuccess = verifyPassword('BootstrapPass123!', createdAdmin.passwordHash);
        if (!loginSuccess) {
          throw new Error('Failed to verify correct password on bootstrapped admin account');
        }
      } finally {
        process.env.BOOTSTRAP_ADMIN_EMAIL = originalEnvEmail;
        process.env.BOOTSTRAP_ADMIN_PASSWORD = originalEnvPassword;
      }
    });

    // SCENARIO 7: Bootstrap Already Exists - Password Preserved, No Duplicate Account
    await runScenario('AUTH-BST-002', 'Preserving Existing Bootstrap Account on Restart', 'STATUS_ENFORCEMENT', () => {
      const originalEnvEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
      const originalEnvPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

      process.env.BOOTSTRAP_ADMIN_EMAIL = 'TestBootstrapAdmin@leaklens.test';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'BootstrapPass123!';

      try {
        db['data'].users = [];
        seedDefaultUsersIfEmpty();

        const count1 = db.getUsers().length;
        const admin1 = db.getUsers().find((u) => u.email === 'testbootstrapadmin@leaklens.test');
        if (!admin1) throw new Error('First seed failed to create admin');
        const hash1 = admin1.passwordHash;

        // Run bootstrap again simulating server restart
        seedDefaultUsersIfEmpty();

        const count2 = db.getUsers().length;
        const admin2 = db.getUsers().find((u) => u.email === 'testbootstrapadmin@leaklens.test');
        if (!admin2) throw new Error('Second seed failed to find admin');

        if (count1 !== count2) {
          throw new Error('Second bootstrap created duplicate admin accounts on restart');
        }
        if (admin1.id !== admin2.id) {
          throw new Error('Second bootstrap changed the user ID of the existing admin');
        }
        if (hash1 !== admin2.passwordHash) {
          throw new Error('Second bootstrap incorrectly changed/overwrote the existing password hash');
        }
      } finally {
        process.env.BOOTSTRAP_ADMIN_EMAIL = originalEnvEmail;
        process.env.BOOTSTRAP_ADMIN_PASSWORD = originalEnvPassword;
      }
    });

    // SCENARIO 8: Bootstrap Case Normalization Casing Differences
    await runScenario('AUTH-BST-003', 'Handling Email Casing Normalization on Bootstrap', 'STATUS_ENFORCEMENT', () => {
      const originalEnvEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
      const originalEnvPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

      try {
        db['data'].users = [];
        
        // Seed first with Mixed Casing
        process.env.BOOTSTRAP_ADMIN_EMAIL = 'TESTAdmin@LeakLens.test';
        process.env.BOOTSTRAP_ADMIN_PASSWORD = 'BootstrapPass123!';
        seedDefaultUsersIfEmpty();

        const count1 = db.getUsers().length;
        const admin1 = db.getUsers().find((u) => u.email === 'testadmin@leaklens.test');
        if (!admin1) throw new Error('Mixed case email did not resolve to normalized lowercase on creation');

        // Seed second with different casing representing restart / lookup mismatch
        process.env.BOOTSTRAP_ADMIN_EMAIL = 'testadmin@leaklens.test';
        seedDefaultUsersIfEmpty();

        const count2 = db.getUsers().length;
        if (count1 !== count2) {
          throw new Error('Casing differences caused duplicate bootstrap admin accounts to be created');
        }
      } finally {
        process.env.BOOTSTRAP_ADMIN_EMAIL = originalEnvEmail;
        process.env.BOOTSTRAP_ADMIN_PASSWORD = originalEnvPassword;
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

// CLI test runner entry point
if (process.argv[1]?.endsWith('authTestSuite.ts') || process.argv[1]?.endsWith('authTestSuite')) {
  console.log('\n======================================================');
  console.log('RUNNING SYSTEM AUTHENTICATION & BOOTSTRAP TEST SUITE');
  console.log('======================================================\n');
  
  runAllAuthTests()
    .then((report) => {
      console.log('------------------------------------------------------');
      console.log(`Summary: ${report.summary}`);
      console.log('------------------------------------------------------\n');
      
      report.results.forEach((r) => {
        const mark = r.status === 'PASSED' ? '✓' : '✗';
        console.log(`${mark} [${r.id}] ${r.name} (${r.durationMs}ms)`);
        if (r.status === 'FAILED') {
          console.error(`  ↳ Error: ${r.details}`);
        }
      });
      
      console.log('\n======================================================');
      if (report.failedCount > 0) {
        console.error(`TEST SUITE FAILED: ${report.failedCount} scenario(s) failed.`);
        process.exit(1);
      } else {
        console.log('ALL SCENARIOS PASSED SUCCESSFULLY!');
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('Fatal Test Runner Exception:', err);
      process.exit(1);
    });
}
