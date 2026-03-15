import type {
	IIdentityProvider,
	SignInRequest,
	IdentityCallbackResult
} from './identity-provider.js';

export class DevIdentityProvider implements IIdentityProvider {
	async generateSignInRequest(callbackUrl: string): Promise<SignInRequest> {
		return {
			redirectUrl: `${callbackUrl}?code=dev-code&state=dev-state`,
			state: 'dev-state',
			nonce: 'dev-nonce'
		};
	}

	async verifyCallback(params: Record<string, string>): Promise<IdentityCallbackResult> {
		return {
			email: params.email ?? 'dev@margin.app',
			displayName: params.name ?? 'Dev User',
			verified: true,
			providerRef: 'dev-provider'
		};
	}
}
