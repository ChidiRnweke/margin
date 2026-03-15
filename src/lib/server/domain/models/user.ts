import type { EmailAddress } from '../value-objects/email-address.js';
import type { DisplayName } from '../value-objects/display-name.js';
import type { IanaTimezone } from '../value-objects/iana-timezone.js';

export interface User {
	readonly id: string;
	readonly email: string;
	readonly displayName: string;
	readonly timezoneNameIana: string;
	readonly utcOffsetMinutesSnapshot: number;
	readonly dstOffsetMinutesSnapshot: number;
	readonly identityVerified: boolean;
	readonly createdAt: Date;
}

export function createUser(params: {
	id: string;
	email: EmailAddress;
	displayName: DisplayName;
	timezone: IanaTimezone;
	utcOffsetMinutes: number;
	dstOffsetMinutes: number;
}): User {
	return {
		id: params.id,
		email: params.email.value,
		displayName: params.displayName.value,
		timezoneNameIana: params.timezone.value,
		utcOffsetMinutesSnapshot: params.utcOffsetMinutes,
		dstOffsetMinutesSnapshot: params.dstOffsetMinutes,
		identityVerified: false,
		createdAt: new Date()
	};
}
