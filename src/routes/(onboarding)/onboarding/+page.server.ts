import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
default: async ({ locals }) => {
// TODO: Wire to ProfileController.completeOnboarding via locals.factory
// const userId = locals.principal!.userId;
// const factory = locals.factory;
// await factory.profileController.completeOnboarding(userId);
if (!locals.principal) {
redirect(302, '/login');
}
return { success: true };
}
};
