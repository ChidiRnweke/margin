import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { setSessionCookie } from '$lib/server/infra/auth/session-cookie.js';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		redirect(302, '/login');
	}

	// In dev mode, create a dev session
	const userId = 'dev-user-id';
	const sessionId = crypto.randomUUID();
	const token = `${userId}:${sessionId}`;

	setSessionCookie(cookies, token, 30 * 24 * 3600); // 30 days

	redirect(302, '/');
};
