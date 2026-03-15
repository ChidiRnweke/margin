import type {
	IIdentityProviderGateway,
	RedirectRequest,
	VerifiedIdentityClaims
} from '$lib/server/services/contracts/identity-provider-gateway.js';
import type { IIdentityProvider } from '$lib/server/infra/providers/identity-provider.js';

export class IdentityProviderGatewayAdapter implements IIdentityProviderGateway {
	constructor(
		private provider: IIdentityProvider,
		private callbackUrl: string
	) {}

	async buildSignInRequest(): Promise<RedirectRequest> {
		const result = await this.provider.generateSignInRequest(this.callbackUrl);
		return { url: result.redirectUrl, state: result.state };
	}

	async verifyCallback(input: Record<string, unknown>): Promise<VerifiedIdentityClaims> {
		const params: Record<string, string> = {};
		for (const [k, v] of Object.entries(input)) {
			params[k] = String(v);
		}
		const result = await this.provider.verifyCallback(params);
		return {
			email: result.email,
			displayName: result.displayName,
			providerSubject: result.providerRef
		};
	}
}
