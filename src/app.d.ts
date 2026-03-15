import type { RequestPrincipal } from '$lib/server/infra/auth/principals.js';

declare global {
	namespace App {
		interface Error {
			code?: string;
			message: string;
		}
		interface Locals {
			principal?: RequestPrincipal;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
