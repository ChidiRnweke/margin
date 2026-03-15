export interface ReminderPolicy {
	snoozeLimit: number;
	maxRetries: number;
	retryBaseMinutes: number;
	dailyRetryWindowStartHour: number;
	dailyRetryWindowEndHour: number;
}

export function computeNextRetryAt(
	policy: ReminderPolicy,
	attemptNumber: number,
	now: Date
): Date | null {
	if (attemptNumber >= policy.maxRetries) return null;

	const backoffMinutes = policy.retryBaseMinutes * Math.pow(2, attemptNumber);
	const candidate = new Date(now.getTime() + backoffMinutes * 60_000);

	// Clamp to retry window
	const candidateHour = candidate.getUTCHours();
	if (
		candidateHour < policy.dailyRetryWindowStartHour ||
		candidateHour >= policy.dailyRetryWindowEndHour
	) {
		// Push to next day's window start
		const next = new Date(candidate);
		next.setUTCDate(next.getUTCDate() + 1);
		next.setUTCHours(policy.dailyRetryWindowStartHour, 0, 0, 0);
		return next;
	}

	return candidate;
}
