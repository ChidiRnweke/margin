import type { IAspectTargetValidator } from '$lib/server/services/contracts/aspect-target-validator.js';
import type { Aspect } from '$lib/server/domain/models/aspect.js';
import { TargetPercentTotalError } from '$lib/server/errors/domain-errors.js';
import { AspectStatus } from '$lib/server/domain/enums.js';

export class AspectTargetValidator implements IAspectTargetValidator {
	ensureActiveTargetsTotal100(aspects: unknown[]): void {
		const typed = aspects as Aspect[];
		const active = typed.filter(
			(a) => a.status === AspectStatus.Active && a.targetPercentage !== null
		);
		if (active.length === 0) return;

		const sum = active.reduce((acc, a) => acc + (a.targetPercentage ?? 0), 0);
		if (sum !== 100) {
			throw new TargetPercentTotalError(sum);
		}
	}
}
