import type { AppFactory } from './app-factory.js';

export interface RequestScope {
	userId: string;
	sessionId: string;
	factory: AppFactory;
}
