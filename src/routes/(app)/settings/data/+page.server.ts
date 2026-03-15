import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.principal?.userId;
	if (userId) {
		const factory = AppFactory.create(db);
		await factory.dataPortabilityController.exportUserData(userId).catch(() => null);
	}

	return {
		lastExport: null as string | null,
		lastImport: null as string | null
	};
};
