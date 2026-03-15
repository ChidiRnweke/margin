export interface AuthSessionResult {
  userId: string;
  sessionToken: string;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

export interface SessionExpiryResult {
  expiredCount: number;
}

export interface IAuthService {
  resolveIdentityCallback(claims: Record<string, unknown>): Promise<AuthSessionResult>;
  logout(sessionId: string): Promise<void>;
  expireSessions(now: Date): Promise<SessionExpiryResult>;
  deleteAccount(userId: string, sessionId: string): Promise<void>;
}
