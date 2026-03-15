import { UnauthorisedError } from '$lib/server/errors/domain-errors.js';

export function requireVerifiedIdentity(user: { identityVerified: boolean }): void {
	if (!user.identityVerified) {
		throw new UnauthorisedError('Identity not yet verified');
	}
}
