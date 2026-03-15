import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.principal) {
		redirect(302, '/login');
	}
	return {
		onboardingComplete: false
	};
};

export const actions = {
	default: async ({ locals }) => {
		if (!locals.principal) {
			redirect(302, '/login');
		}
		return { success: true };
	}
} satisfies Actions;
