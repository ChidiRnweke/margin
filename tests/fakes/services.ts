/**
 * Hand-rolled fake services for controller and route testing.
 */

import type {
	IIdentityProviderGateway,
	VerifiedIdentityClaims,
	RedirectRequest
} from '$lib/server/services/contracts/identity-provider-gateway.js';

export class FakeIdentityProviderGateway implements IIdentityProviderGateway {
	private _signInUrl = 'https://provider.example.com/auth';
	private _claims: VerifiedIdentityClaims | null = null;
	private _shouldFail = false;

	async buildSignInRequest(): Promise<RedirectRequest> {
		return { url: this._signInUrl, state: 'test-state' };
	}

	async verifyCallback(_input: Record<string, unknown>): Promise<VerifiedIdentityClaims> {
		if (this._shouldFail) throw new Error('Verification failed');
		if (!this._claims) throw new Error('No claims configured in fake');
		return this._claims;
	}

	// Test helpers
	setClaims(claims: VerifiedIdentityClaims) {
		this._claims = claims;
	}
	setSignInUrl(url: string) {
		this._signInUrl = url;
	}
	setShouldFail(fail: boolean) {
		this._shouldFail = fail;
	}
}

export class FakeRecurrenceMaterializer {
	private _result: { generated: boolean; taskId?: string; reason?: string } = {
		generated: false,
		reason: 'no series'
	};

	async generateNextInstance(_completedTaskId: string) {
		return { ...this._result };
	}

	// Test helpers
	setResult(result: { generated: boolean; taskId?: string; reason?: string }) {
		this._result = result;
	}
}

export class FakeAccountErasureService {
	public erasedUserIds: string[] = [];

	async eraseUserAccount(userId: string) {
		this.erasedUserIds.push(userId);
	}
}

export class FakeAuditEmitter {
	public emittedEvents: Array<{ eventType: string; entityType: string; entityId?: string }> = [];

	emit(event: { eventType: string; entityType: string; entityId?: string }) {
		this.emittedEvents.push(event);
	}
}
