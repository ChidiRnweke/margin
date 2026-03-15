export interface EffectiveWindow {
	startUtc: string;
	endUtc: string;
	sourceBlockId: string;
}

export interface IAvailabilityWindowResolver {
	resolveEffectiveWindows(
		blocks: unknown[],
		range: { rangeStart: string; rangeEnd: string },
		timezone: string
	): EffectiveWindow[];
}
