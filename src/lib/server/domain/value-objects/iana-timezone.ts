import { InputError } from '$lib/server/errors/domain-errors.js';
import { isValidIanaTimezone } from '$lib/server/config/timezone-policy.js';

export class IanaTimezone {
  readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Timezone is required');
    if (!isValidIanaTimezone(trimmed)) {
      throw new InputError(`Invalid IANA timezone: ${trimmed}`);
    }
    this.value = trimmed;
  }

  toString(): string { return this.value; }
}
