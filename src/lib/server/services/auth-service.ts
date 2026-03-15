import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';
import type { ISessionRepository } from '$lib/server/repositories/contracts/session-repository.js';
import type { IPlanningProfileRepository } from '$lib/server/repositories/contracts/planning-profile-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type {
	IIdentityProviderGateway,
	VerifiedIdentityClaims
} from '$lib/server/services/contracts/identity-provider-gateway.js';
import type { IAccountErasureService } from '$lib/server/services/contracts/account-erasure-service.js';
import type {
	IAuthService,
	AuthSessionResult,
	SessionExpiryResult
} from '$lib/server/services/contracts/auth-service.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import { createUser } from '$lib/server/domain/models/user.js';
import { createSession } from '$lib/server/domain/models/session.js';
import { createDefaultPlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import { EmailAddress } from '$lib/server/domain/value-objects/email-address.js';
import { DisplayName } from '$lib/server/domain/value-objects/display-name.js';
import { IanaTimezone } from '$lib/server/domain/value-objects/iana-timezone.js';
import { PrincipalType } from '$lib/server/domain/enums.js';

const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService implements IAuthService {
	constructor(
		private userRepo: IUserRepository,
		private sessionRepo: ISessionRepository,
		private profileRepo: IPlanningProfileRepository,
		private aspectRepo: IAspectRepository,
		private identityGateway: IIdentityProviderGateway,
		private accountErasure: IAccountErasureService,
		private auditEmitter: AuditEmitter
	) {}

	async resolveIdentityCallback(claims: Record<string, unknown>): Promise<AuthSessionResult> {
		const verified: VerifiedIdentityClaims = await this.identityGateway.verifyCallback(claims);

		let isNewUser = false;
		let user = await this.userRepo.findByIdentityClaim({ email: verified.email });

		if (!user) {
			isNewUser = true;
			user = await this.userRepo.create(
				createUser({
					id: crypto.randomUUID(),
					email: new EmailAddress(verified.email),
					displayName: new DisplayName(verified.displayName),
					timezone: new IanaTimezone('UTC'),
					utcOffsetMinutes: 0,
					dstOffsetMinutes: 0
				})
			);

			const profile = createDefaultPlanningProfile(user.id);
			await this.profileRepo.save(profile, 0);
		}

		const sessionToken = crypto.randomUUID();
		const tokenHash = await hashToken(sessionToken);

		const session = createSession({
			id: crypto.randomUUID(),
			userId: user.id,
			sessionTokenHash: tokenHash,
			expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS)
		});
		await this.sessionRepo.create(session);

		const activeAspects = await this.aspectRepo.listActiveForUser(user.id);
		const needsOnboarding = activeAspects.length === 0;

		await this.auditEmitter.emit({
			userId: user.id,
			actorPrincipalType: PrincipalType.UserSession,
			actorPrincipalRef: session.id,
			eventType: isNewUser ? 'user.registered' : 'user.logged_in',
			entityType: 'User',
			entityId: user.id
		});

		return { userId: user.id, sessionToken, isNewUser, needsOnboarding };
	}

	async logout(sessionId: string): Promise<void> {
		await this.sessionRepo.revoke(sessionId);
	}

	async expireSessions(now: Date): Promise<SessionExpiryResult> {
		const expiredCount = await this.sessionRepo.expirePastLifetime(now);
		return { expiredCount };
	}

	async deleteAccount(userId: string, sessionId: string): Promise<void> {
		await this.sessionRepo.revoke(sessionId);
		await this.accountErasure.eraseUserAccount(userId);
	}
}

async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(token);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
