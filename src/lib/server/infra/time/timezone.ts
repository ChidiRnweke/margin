export { resolveTimezoneOffset, isValidIanaTimezone } from '$lib/server/config/timezone-policy.js';

export function getIsoMondayOfWeek(date: Date): string {
	const d = new Date(date);
	const day = d.getUTCDay();
	const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
	d.setUTCDate(diff);
	return d.toISOString().split('T')[0];
}

export function getIsoSundayOfWeek(mondayStr: string): string {
	const monday = new Date(mondayStr + 'T00:00:00Z');
	monday.setUTCDate(monday.getUTCDate() + 6);
	return monday.toISOString().split('T')[0];
}
