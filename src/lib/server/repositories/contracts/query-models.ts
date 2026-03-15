export interface PaginationQuery {
	cursor?: string;
	limit?: number;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

export interface Page<T> {
	items: T[];
	totalCount: number;
	cursor: string | null;
	hasMore: boolean;
}

// Dashboard projection
export interface DashboardProjection {
	totalAspects: number;
	activeAspects: number;
	totalTasks: number;
	overdueTasks: number;
	tasksInProgress: number;
	tasksDone: number;
	currentWeekCycleStatus: string | null;
	upcomingReminders: Array<{
		id: string;
		taskId: string;
		taskTitle: string;
		remindAtUtc: Date;
		channel: string;
	}>;
}

// Availability projection for planning
export interface AvailabilitySlot {
	startUtc: Date;
	endUtc: Date;
	durationMinutes: number;
}

// Export format projection
export interface ExportPayload {
	exportedAt: string;
	user: { id: string; email: string; displayName: string; timezone: string };
	aspects: Array<Record<string, unknown>>;
	milestones: Array<Record<string, unknown>>;
	tasks: Array<Record<string, unknown>>;
	recurringSeries: Array<Record<string, unknown>>;
	availabilityBlocks: Array<Record<string, unknown>>;
	planningCycles: Array<Record<string, unknown>>;
	reminders: Array<Record<string, unknown>>;
}
