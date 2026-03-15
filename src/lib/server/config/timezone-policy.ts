export function resolveTimezoneOffset(
	timezone: string,
	at: Date
): { utcOffsetMinutes: number; dstOffsetMinutes: number } {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset'
		});

		const parts = formatter.formatToParts(at);
		const tzPart = parts.find((p) => p.type === 'timeZoneName');
		if (!tzPart) return { utcOffsetMinutes: 0, dstOffsetMinutes: 0 };

		// Parse offset like "GMT+05:30" or "GMT-08:00"
		const match = tzPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
		if (!match) return { utcOffsetMinutes: 0, dstOffsetMinutes: 0 };

		const sign = match[1] === '+' ? 1 : -1;
		const hours = parseInt(match[2], 10);
		const minutes = parseInt(match[3] || '0', 10);
		const totalMinutes = sign * (hours * 60 + minutes);

		// DST detection: compare with January offset
		const jan = new Date(at.getFullYear(), 0, 1);
		const janFormatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset'
		});
		const janParts = janFormatter.formatToParts(jan);
		const janTzPart = janParts.find((p) => p.type === 'timeZoneName');
		let janOffset = 0;
		if (janTzPart) {
			const janMatch = janTzPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
			if (janMatch) {
				const janSign = janMatch[1] === '+' ? 1 : -1;
				janOffset =
					janSign * (parseInt(janMatch[2], 10) * 60 + parseInt(janMatch[3] || '0', 10));
			}
		}

		const dstOffsetMinutes = totalMinutes - janOffset;

		return { utcOffsetMinutes: totalMinutes, dstOffsetMinutes };
	} catch {
		return { utcOffsetMinutes: 0, dstOffsetMinutes: 0 };
	}
}

export function isValidIanaTimezone(tz: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}
