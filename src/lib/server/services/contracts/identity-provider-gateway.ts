export interface RedirectRequest {
  url: string;
  state: string;
}

export interface VerifiedIdentityClaims {
  email: string;
  displayName: string;
  providerSubject: string;
}

export interface IIdentityProviderGateway {
  buildSignInRequest(): Promise<RedirectRequest>;
  verifyCallback(input: Record<string, unknown>): Promise<VerifiedIdentityClaims>;
}
