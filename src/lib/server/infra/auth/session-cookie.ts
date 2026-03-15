import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'margin_session';
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: true
};

export function setSessionCookie(cookies: Cookies, token: string, maxAgeSeconds: number): void {
	cookies.set(SESSION_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: maxAgeSeconds });
}

export function getSessionCookie(cookies: Cookies): string | undefined {
	return cookies.get(SESSION_COOKIE_NAME);
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
