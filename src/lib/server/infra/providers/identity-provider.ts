export interface SignInRequest {
	redirectUrl: string;
	state: string;
	nonce: string;
}

export interface IdentityCallbackResult {
	email: string;
	displayName: string;
	verified: boolean;
	providerRef: string;
}

export interface IIdentityProvider {
	generateSignInRequest(callbackUrl: string): Promise<SignInRequest>;
	verifyCallback(params: Record<string, string>): Promise<IdentityCallbackResult>;
}
