import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals }) => {
		// Redirect to identity provider
		redirect(302, '/callback?code=dev-code');
	}
} satisfies Actions;
