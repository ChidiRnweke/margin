import { AspectStatus } from '../enums.js';
import { AspectName, AspectPurpose } from '../value-objects/string-values.js';
import { TargetPercentage } from '../value-objects/bounded-int.js';
import { StateTransitionError, InputError } from '$lib/server/errors/domain-errors.js';

export interface Aspect {
	readonly id: string;
	readonly userId: string;
	readonly name: string;
	readonly purpose: string | null;
	readonly status: string;
	readonly targetPercentage: number | null;
	readonly defaultSplittable: boolean;
	readonly version: number;
	readonly createdAt: Date;
	readonly archivedAt: Date | null;
}

export function createAspect(params: {
	id: string;
	userId: string;
	name: string;
	purpose?: string;
}): Aspect {
	new AspectName(params.name);
	return {
		id: params.id,
		userId: params.userId,
		name: params.name.trim(),
		purpose: params.purpose?.trim() || null,
		status: AspectStatus.Draft,
		targetPercentage: null,
		defaultSplittable: false,
		version: 1,
		createdAt: new Date(),
		archivedAt: null
	};
}

export function activateAspect(
	aspect: Aspect,
	input: { targetPercentage: number; purpose?: string }
): Aspect {
	if (aspect.status !== AspectStatus.Draft) {
		throw new StateTransitionError(`Cannot activate aspect in ${aspect.status} status`);
	}
	const purpose = input.purpose ?? aspect.purpose;
	if (!purpose) throw new InputError('Purpose is required for activation');
	new AspectPurpose(purpose);
	new TargetPercentage(input.targetPercentage);

	return {
		...aspect,
		status: AspectStatus.Active,
		purpose,
		targetPercentage: input.targetPercentage
	};
}

export function archiveAspect(aspect: Aspect): Aspect {
	if (aspect.status === AspectStatus.Archived) {
		throw new StateTransitionError('Aspect is already archived');
	}
	return { ...aspect, status: AspectStatus.Archived, archivedAt: new Date() };
}

export function restoreAspectToDraft(aspect: Aspect): Aspect {
	if (aspect.status !== AspectStatus.Archived) {
		throw new StateTransitionError('Can only restore archived aspects');
	}
	return { ...aspect, status: AspectStatus.Draft, archivedAt: null, targetPercentage: null };
}
