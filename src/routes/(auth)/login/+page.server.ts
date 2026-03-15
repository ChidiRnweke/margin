import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async () => {
		// In dev mode, redirect directly to callback with dev code
		redirect(302, '/callback?code=dev-code&state=dev-state');
	}
} satisfies Actions;
