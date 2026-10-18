import { AuthSession } from '../types';

/**
 * MOCK AUTHENTICATION SERVICE FOR STUDENT PORTAL
 * NOTE FOR STAGE D: In Stage D, this service will be wired to Supabase Auth
 * using internal authentication mapping derived from student roll numbers.
 * The client UI and route guards will consume this exact API surface without changes.
 */

const SESSION_KEY = 'ua_student_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout

// MOCK ONLY: In-memory student credentials store
const mockStudentCredentials = new Map<string, { password: string; mustChange: boolean }>([
  ['UA-2026-0001', { password: 'Temp#2026', mustChange: true }],
  ['UA-2026-0002', { password: 'Student#2026', mustChange: false }],
]);

// Brute-force protection tracking
let failedAttempts = 0;
let lockoutUntil = 0;

// Listeners for reactive auth state changes across components
type AuthListener = (session: AuthSession | null) => void;
const listeners = new Set<AuthListener>();

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(session: AuthSession | null) {
  listeners.forEach((fn) => fn(session));
}

/**
 * Get remaining lockout time in seconds, or 0 if not locked
 */
export function getLockoutRemainingSeconds(): number {
  const now = Date.now();
  if (now < lockoutUntil) {
    return Math.ceil((lockoutUntil - now) / 1000);
  }
  return 0;
}

/**
 * Get active session, checking for 30-min inactivity timeout.
 */
export function getSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: AuthSession = JSON.parse(raw);
    const now = Date.now();

    if (now > session.expires_at) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.setItem('ua_session_expired', 'true');
      notifyListeners(null);
      return null;
    }

    return session;
  } catch (e) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Check if the user was recently logged out due to session timeout.
 */
export function consumeSessionExpiredNotice(): boolean {
  try {
    const wasExpired = sessionStorage.getItem('ua_session_expired') === 'true';
    if (wasExpired) {
      sessionStorage.removeItem('ua_session_expired');
      return true;
    }
  } catch (e) {
    // Ignore storage issues
  }
  return false;
}

/**
 * Refresh current session expiration timestamp on user activity.
 */
export function refreshSession(): void {
  const current = getSession();
  if (!current) return;

  current.expires_at = Date.now() + SESSION_TIMEOUT_MS;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(current));
  } catch (e) {
    // Ignore
  }
}

/**
 * Authenticate student with roll number and password.
 */
export async function login(
  rollNoRaw: string,
  passwordRaw: string
): Promise<{ success: boolean; session?: AuthSession; error?: string; lockoutSeconds?: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const remainingLockout = getLockoutRemainingSeconds();
      if (remainingLockout > 0) {
        resolve({
          success: false,
          error: 'Account temporarily locked due to multiple failed attempts.',
          lockoutSeconds: remainingLockout,
        });
        return;
      }

      const normalizedRoll = rollNoRaw.trim().toUpperCase();
      const account = mockStudentCredentials.get(normalizedRoll);

      if (!account || account.password !== passwordRaw) {
        failedAttempts++;
        if (failedAttempts >= LOCKOUT_ATTEMPTS) {
          lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          failedAttempts = 0;
          resolve({
            success: false,
            error: 'Account locked due to 5 consecutive failed attempts.',
            lockoutSeconds: 60,
          });
          return;
        }

        // Generic error message: never reveal whether roll or password was wrong
        resolve({
          success: false,
          error: 'Roll number or password is incorrect',
        });
        return;
      }

      // Successful login resets lockout
      failedAttempts = 0;
      lockoutUntil = 0;

      const session: AuthSession = {
        role: 'student',
        roll_no: normalizedRoll,
        must_change_password: account.mustChange,
        expires_at: Date.now() + SESSION_TIMEOUT_MS,
      };

      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn('Unable to write to sessionStorage:', e);
      }

      notifyListeners(session);
      resolve({ success: true, session });
    }, 400);
  });
}

/**
 * Log out student and clear session.
 */
export function logout(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('ua_session_expired');
  } catch (e) {
    // Ignore
  }
  notifyListeners(null);
}

/**
 * Change student password.
 */
export async function changePassword(
  currentPasswordRaw: string,
  newPasswordRaw: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = getSession();
      if (!session) {
        resolve({ success: false, error: 'Session expired. Please log in again.' });
        return;
      }

      const account = mockStudentCredentials.get(session.roll_no);
      if (!account || account.password !== currentPasswordRaw) {
        resolve({ success: false, error: 'Current password is incorrect.' });
        return;
      }

      // Validate new password rules: at least 8 chars, at least one letter and one number
      if (newPasswordRaw.length < 8) {
        resolve({ success: false, error: 'New password must be at least 8 characters long.' });
        return;
      }
      if (!/[A-Za-z]/.test(newPasswordRaw) || !/[0-9]/.test(newPasswordRaw)) {
        resolve({ success: false, error: 'New password must contain both letters and numbers.' });
        return;
      }
      if (newPasswordRaw === currentPasswordRaw) {
        resolve({ success: false, error: 'New password cannot equal the current password.' });
        return;
      }

      // Update in mock credentials
      account.password = newPasswordRaw;
      account.mustChange = false;

      // Update session
      session.must_change_password = false;
      session.expires_at = Date.now() + SESSION_TIMEOUT_MS;
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        // Ignore
      }

      notifyListeners(session);
      resolve({ success: true });
    }, 400);
  });
}
