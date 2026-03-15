export interface IAspectTargetValidator {
	ensureActiveTargetsTotal100(aspects: unknown[]): void;
}
