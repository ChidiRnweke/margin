export interface IdempotencyKey {
	readonly id: string;
	readonly userId: string;
	readonly commandName: string;
	readonly keyHash: string;
	readonly requestHash: string;
	readonly responseRef: string;
	readonly createdAt: Date;
	readonly expiresAt: Date;
}

export function createIdempotencyKey(params: {
	id: string;
	userId: string;
	commandName: string;
	keyHash: string;
	requestHash: string;
	responseRef: string;
	expiresAt: Date;
}): IdempotencyKey {
	return { ...params, createdAt: new Date() };
}
