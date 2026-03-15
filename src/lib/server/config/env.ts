import { env } from '$env/dynamic/private';

export interface AppConfig {
	database: { url: string };
	identity: {
		clientId: string;
		clientSecret: string;
		callbackUrl: string;
		issuerUrl: string;
	};
	session: {
		secret: string;
		maxLifetimeHours: number;
	};
	app: { baseUrl: string };
	email: {
		apiKey: string;
		fromAddress: string;
	};
	reminder: {
		snoozeLimit: number;
		maxRetries: number;
		retryBaseMinutes: number;
		dailyRetryWindowStartHour: number;
		dailyRetryWindowEndHour: number;
	};
	timezone: { default: string };
	hatchet: { clientToken: string };
}

function requireEnv(key: string): string {
	const value = env[key];
	if (!value) throw new Error(`Missing required environment variable: ${key}`);
	return value;
}

function optionalEnv(key: string, fallback: string): string {
	return env[key] || fallback;
}

function requirePositiveInt(key: string, fallback?: number): number {
	const raw = env[key];
	if (!raw && fallback !== undefined) return fallback;
	if (!raw) throw new Error(`Missing required environment variable: ${key}`);
	const parsed = parseInt(raw, 10);
	if (isNaN(parsed) || parsed <= 0)
		throw new Error(`${key} must be a positive integer, got: ${raw}`);
	return parsed;
}

function requireNonNegativeInt(key: string, fallback?: number): number {
	const raw = env[key];
	if (!raw && fallback !== undefined) return fallback;
	if (!raw) throw new Error(`Missing required environment variable: ${key}`);
	const parsed = parseInt(raw, 10);
	if (isNaN(parsed) || parsed < 0)
		throw new Error(`${key} must be a non-negative integer, got: ${raw}`);
	return parsed;
}

export function loadConfig(): AppConfig {
	const config: AppConfig = {
		database: {
			url: requireEnv('DATABASE_URL')
		},
		identity: {
			clientId: optionalEnv('OIDC_CLIENT_ID', ''),
			clientSecret: optionalEnv('OIDC_CLIENT_SECRET', ''),
			callbackUrl: optionalEnv('OIDC_CALLBACK_URL', 'http://localhost:5173/callback'),
			issuerUrl: optionalEnv('OIDC_ISSUER_URL', '')
		},
		session: {
			secret: requireEnv('SESSION_SECRET'),
			maxLifetimeHours: requirePositiveInt('SESSION_MAX_LIFETIME_HOURS', 720)
		},
		app: {
			baseUrl: requireEnv('APP_BASE_URL')
		},
		email: {
			apiKey: optionalEnv('EMAIL_PROVIDER_API_KEY', ''),
			fromAddress: optionalEnv('EMAIL_FROM_ADDRESS', 'noreply@margin.app')
		},
		reminder: {
			snoozeLimit: requirePositiveInt('REMINDER_SNOOZE_LIMIT', 5),
			maxRetries: requirePositiveInt('REMINDER_MAX_RETRIES', 3),
			retryBaseMinutes: requirePositiveInt('REMINDER_RETRY_BASE_MINUTES', 15),
			dailyRetryWindowStartHour: requireNonNegativeInt('REMINDER_DAILY_RETRY_WINDOW_START_HOUR', 8),
			dailyRetryWindowEndHour: requirePositiveInt('REMINDER_DAILY_RETRY_WINDOW_END_HOUR', 22)
		},
		timezone: {
			default: optionalEnv('DEFAULT_TIMEZONE', 'UTC')
		},
		hatchet: {
			clientToken: optionalEnv('HATCHET_CLIENT_TOKEN', '')
		}
	};

	// Validate reminder retry window
	if (config.reminder.dailyRetryWindowStartHour >= config.reminder.dailyRetryWindowEndHour) {
		throw new Error(
			'REMINDER_DAILY_RETRY_WINDOW_START_HOUR must be less than REMINDER_DAILY_RETRY_WINDOW_END_HOUR'
		);
	}

	if (config.reminder.dailyRetryWindowEndHour > 23) {
		throw new Error('REMINDER_DAILY_RETRY_WINDOW_END_HOUR must be at most 23');
	}

	// Validate timezone
	try {
		Intl.DateTimeFormat(undefined, { timeZone: config.timezone.default });
	} catch {
		throw new Error(`Invalid default timezone: ${config.timezone.default}`);
	}

	return config;
}
