import { InputError } from '$lib/server/errors/domain-errors.js';

export class DisplayName {
	readonly value: string;

	constructor(value: string) {
		const trimmed = value.trim();
		if (!trimmed) throw new InputError('Display name is required');
		if (trimmed.length > 200) throw new InputError('Display name must be 200 characters or fewer');
		this.value = trimmed;
	}

	toString(): string {
		return this.value;
	}
}
