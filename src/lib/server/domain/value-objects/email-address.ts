import { InputError } from '$lib/server/errors/domain-errors.js';

export class EmailAddress {
	readonly value: string;

	constructor(value: string) {
		const trimmed = value.trim().toLowerCase();
		if (!trimmed) throw new InputError('Email address is required');
		if (!trimmed.includes('@') || trimmed.length < 3) {
			throw new InputError('Invalid email address format', { email: trimmed });
		}
		this.value = trimmed;
	}

	equals(other: EmailAddress): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
