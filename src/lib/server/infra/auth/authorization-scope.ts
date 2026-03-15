import { OwnershipError } from '$lib/server/errors/domain-errors.js';

export function enforceOwnership(resourceUserId: string, requestUserId: string): void {
	if (resourceUserId !== requestUserId) {
		throw new OwnershipError();
	}
}
