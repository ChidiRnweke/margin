import type { IAuthService } from '$lib/server/services/contracts/auth-service.js';
import type { IIdentityProviderGateway } from '$lib/server/services/contracts/identity-provider-gateway.js';

export class AuthController {
	constructor(
		private authService: IAuthService,
		private identityGateway: IIdentityProviderGateway
	) {}

	async startSignIn() {
		return this.identityGateway.buildSignInRequest();
	}

	async handleIdentityCallback(claims: Record<string, unknown>) {
		return this.authService.resolveIdentityCallback(claims);
	}

	async logout(sessionId: string) {
		return this.authService.logout(sessionId);
	}

	async deleteAccount(userId: string, sessionId: string) {
		return this.authService.deleteAccount(userId, sessionId);
	}
}
