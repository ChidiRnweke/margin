/**
 * Hand-rolled fake repositories for unit testing.
 * Each implements the corresponding repository contract interface.
 * State is held in simple arrays/maps for inspection in tests.
 */

export class FakeUserRepository {
	private users: Map<
		string,
		{
			id: string;
			email: string;
			displayName: string;
			timezone: string;
			identityVerified: boolean;
			createdAt: Date;
		}
	> = new Map();

	async findById(userId: string) {
		const user = this.users.get(userId);
		if (!user) return undefined;
		return { ...user };
	}

	async findByIdentityClaim(claims: Record<string, unknown>) {
		const email = claims.email as string;
		for (const user of this.users.values()) {
			if (user.email === email) return { ...user };
		}
		return undefined;
	}

	async create(user: {
		id: string;
		email: string;
		displayName: string;
		timezone: string;
		identityVerified: boolean;
		createdAt: Date;
	}) {
		this.users.set(user.id, { ...user });
		return { ...user };
	}

	async delete(userId: string) {
		this.users.delete(userId);
	}

	// Test helpers
	seed(user: {
		id: string;
		email: string;
		displayName: string;
		timezone: string;
		identityVerified: boolean;
		createdAt: Date;
	}) {
		this.users.set(user.id, { ...user });
	}

	getAll() {
		return [...this.users.values()];
	}
}

export class FakeSessionRepository {
	private sessions: Map<
		string,
		{
			id: string;
			userId: string;
			sessionTokenHash: string;
			status: string;
			createdAt: Date;
			expiresAt: Date;
			revokedAt?: Date;
		}
	> = new Map();

	async create(session: {
		id: string;
		userId: string;
		sessionTokenHash: string;
		status: string;
		createdAt: Date;
		expiresAt: Date;
	}) {
		this.sessions.set(session.id, { ...session });
		return { ...session };
	}

	async findActiveByTokenHash(tokenHash: string) {
		for (const session of this.sessions.values()) {
			if (session.sessionTokenHash === tokenHash && session.status === 'Active')
				return { ...session };
		}
		return undefined;
	}

	async revoke(sessionId: string) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.status = 'Revoked';
			session.revokedAt = new Date();
		}
	}

	async revokeAllForUser(userId: string) {
		let count = 0;
		for (const session of this.sessions.values()) {
			if (session.userId === userId && session.status === 'Active') {
				session.status = 'Revoked';
				session.revokedAt = new Date();
				count++;
			}
		}
		return count;
	}

	async expirePastLifetime(now: Date) {
		let count = 0;
		for (const session of this.sessions.values()) {
			if (session.status === 'Active' && session.expiresAt <= now) {
				session.status = 'Expired';
				count++;
			}
		}
		return count;
	}

	// Test helpers
	seed(session: {
		id: string;
		userId: string;
		sessionTokenHash: string;
		status: string;
		createdAt: Date;
		expiresAt: Date;
		revokedAt?: Date;
	}) {
		this.sessions.set(session.id, { ...session });
	}

	getAll() {
		return [...this.sessions.values()];
	}
}

export class FakePlanningProfileRepository {
	private profiles: Map<
		string,
		{
			id: string;
			userId: string;
			urgencyWeight: number;
			importanceWeight: number;
			balanceWeight: number;
			effortFitWeight: number;
			urgentThresholdDays: number;
			minChunkMinutes: number;
			defaultEffortMinutes: number;
			version: number;
			updatedAt: Date;
		}
	> = new Map();

	async getByUserId(userId: string) {
		for (const profile of this.profiles.values()) {
			if (profile.userId === userId) return { ...profile };
		}
		return undefined;
	}

	async save(
		profile: {
			id: string;
			userId: string;
			urgencyWeight: number;
			importanceWeight: number;
			balanceWeight: number;
			effortFitWeight: number;
			urgentThresholdDays: number;
			minChunkMinutes: number;
			defaultEffortMinutes: number;
			version: number;
			updatedAt: Date;
		},
		expectedVersion: number
	) {
		const existing = this.profiles.get(profile.id);
		if (existing && existing.version !== expectedVersion) {
			throw new Error('CONFLICT_STALE_WRITE');
		}
		const saved = { ...profile, version: (existing?.version ?? 0) + 1 };
		this.profiles.set(profile.id, saved);
		return saved;
	}

	// Test helpers
	seed(profile: {
		id: string;
		userId: string;
		urgencyWeight: number;
		importanceWeight: number;
		balanceWeight: number;
		effortFitWeight: number;
		urgentThresholdDays: number;
		minChunkMinutes: number;
		defaultEffortMinutes: number;
		version: number;
		updatedAt: Date;
	}) {
		this.profiles.set(profile.id, { ...profile });
	}

	getAll() {
		return [...this.profiles.values()];
	}
}

export class FakeAspectRepository {
	public archivedIds: string[] = [];
	public restoredIds: string[] = [];
	private aspects: Map<
		string,
		{
			id: string;
			userId: string;
			name: string;
			purpose?: string;
			status: string;
			targetPercentage?: number;
			defaultSplittable: boolean;
			version: number;
			createdAt: Date;
			archivedAt?: Date;
		}
	> = new Map();

	async findById(aspectId: string) {
		const aspect = this.aspects.get(aspectId);
		if (!aspect) return undefined;
		return { ...aspect };
	}

	async save(
		aspect: {
			id: string;
			userId: string;
			name: string;
			purpose?: string;
			status: string;
			targetPercentage?: number;
			defaultSplittable: boolean;
			version: number;
			createdAt: Date;
			archivedAt?: Date;
		},
		expectedVersion: number | null
	) {
		if (expectedVersion !== null) {
			const existing = this.aspects.get(aspect.id);
			if (existing && existing.version !== expectedVersion) {
				throw new Error('CONFLICT_STALE_WRITE');
			}
		}
		const saved = { ...aspect, version: (this.aspects.get(aspect.id)?.version ?? 0) + 1 };
		this.aspects.set(saved.id, saved);
		return saved;
	}

	async archive(aspectId: string, _expectedVersion: number) {
		const aspect = this.aspects.get(aspectId);
		if (aspect) {
			aspect.status = 'Archived';
			aspect.archivedAt = new Date();
			this.archivedIds.push(aspectId);
		}
	}

	async restoreToDraft(aspectId: string, _expectedVersion: number) {
		const aspect = this.aspects.get(aspectId);
		if (aspect) {
			aspect.status = 'Draft';
			aspect.archivedAt = undefined;
			aspect.version++;
			this.restoredIds.push(aspectId);
			return { ...aspect };
		}
		return undefined;
	}

	async query(userId: string, _query: unknown) {
		const items = [...this.aspects.values()].filter((a) => a.userId === userId);
		return { items, nextCursor: undefined };
	}

	async listActiveForUser(userId: string) {
		return [...this.aspects.values()].filter((a) => a.userId === userId && a.status === 'Active');
	}

	async deleteByUserId(userId: string) {
		let count = 0;
		for (const [id, aspect] of this.aspects) {
			if (aspect.userId === userId) {
				this.aspects.delete(id);
				count++;
			}
		}
		return count;
	}

	// Test helpers
	seed(aspect: {
		id: string;
		userId: string;
		name: string;
		purpose?: string;
		status: string;
		targetPercentage?: number;
		defaultSplittable: boolean;
		version: number;
		createdAt: Date;
		archivedAt?: Date;
	}) {
		this.aspects.set(aspect.id, { ...aspect });
	}

	getAll() {
		return [...this.aspects.values()];
	}
}

export class FakeTaskRepository {
	public cancelledFutureAllocationTaskIds: string[] = [];
	public cancelledPendingReminderTaskIds: string[] = [];
	public archivedIds: string[] = [];
	public restoredIds: string[] = [];
	private tasks: Map<
		string,
		{
			id: string;
			aspectId: string;
			milestoneId?: string;
			title: string;
			description?: string;
			effortMinutes: number;
			remainingMinutes: number;
			status: string;
			version: number;
			createdAt: Date;
		}
	> = new Map();

	async findById(taskId: string) {
		return this.tasks.get(taskId) ? { ...this.tasks.get(taskId)! } : undefined;
	}

	async save(
		task: {
			id: string;
			aspectId: string;
			milestoneId?: string;
			title: string;
			description?: string;
			effortMinutes: number;
			remainingMinutes: number;
			status: string;
			version: number;
			createdAt: Date;
		},
		expectedVersion: number | null
	) {
		if (expectedVersion !== null) {
			const existing = this.tasks.get(task.id);
			if (existing && existing.version !== expectedVersion) {
				throw new Error('CONFLICT_STALE_WRITE');
			}
		}
		const saved = { ...task, version: (this.tasks.get(task.id)?.version ?? 0) + 1 };
		this.tasks.set(saved.id, saved);
		return saved;
	}

	async archive(taskId: string, _expectedVersion: number) {
		const task = this.tasks.get(taskId);
		if (task) {
			task.status = 'Archived';
			this.archivedIds.push(taskId);
		}
	}

	async restoreToBacklog(taskId: string, _expectedVersion: number) {
		const task = this.tasks.get(taskId);
		if (task) {
			task.status = 'Backlog';
			task.version++;
			this.restoredIds.push(taskId);
			return { ...task };
		}
		return undefined;
	}

	async bulkLoad(taskIds: string[]) {
		return taskIds.map((id) => this.tasks.get(id)).filter(Boolean) as typeof this.tasks extends Map<
			string,
			infer V
		>
			? V[]
			: never[];
	}

	async query(userId: string, _query: unknown) {
		const query = (_query ?? {}) as Record<string, unknown>;
		const statuses = typeof query.status === 'string' ? String(query.status).split(',') : undefined;
		const items = [...this.tasks.values()].filter((task) => {
			if (query.aspectId && task.aspectId !== query.aspectId) return false;
			if (query.milestoneId && task.milestoneId !== query.milestoneId) return false;
			if (statuses && !statuses.includes(task.status)) return false;
			return userId ? task.aspectId !== '' : true;
		});
		return { items, nextCursor: undefined };
	}

	async loadDetailProjection(taskId: string) {
		return this.tasks.get(taskId) ? { ...this.tasks.get(taskId)! } : undefined;
	}

	async findActiveLock(_taskId: string) {
		return undefined;
	}
	async replaceActiveLock(_taskId: string, _lockInput: unknown) {
		return { id: crypto.randomUUID(), taskId: _taskId, active: true };
	}
	async releaseActiveLock(_taskId: string, _expectedVersion: number) {}
	async cancelFutureAllocations(_taskId: string) {
		this.cancelledFutureAllocationTaskIds.push(_taskId);
		return 0;
	}
	async cancelPendingReminders(_taskId: string) {
		this.cancelledPendingReminderTaskIds.push(_taskId);
		return 0;
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}

	// Test helpers
	seed(task: {
		id: string;
		aspectId: string;
		milestoneId?: string;
		title: string;
		description?: string;
		effortMinutes: number;
		remainingMinutes: number;
		status: string;
		version: number;
		createdAt: Date;
	}) {
		this.tasks.set(task.id, { ...task });
	}

	getAll() {
		return [...this.tasks.values()];
	}

	listByMilestoneId(milestoneId: string) {
		return [...this.tasks.values()].filter((task) => task.milestoneId === milestoneId);
	}

	listByAspectId(aspectId: string) {
		return [...this.tasks.values()].filter((task) => task.aspectId === aspectId);
	}
}

export class FakeMilestoneRepository {
	public archivedIds: string[] = [];
	public restoredIds: string[] = [];
	private milestones: Map<
		string,
		{ id: string; aspectId: string; title: string; status: string; version: number }
	> = new Map();

	async findById(milestoneId: string) {
		return this.milestones.get(milestoneId) ? { ...this.milestones.get(milestoneId)! } : undefined;
	}

	async save(
		milestone: { id: string; aspectId: string; title: string; status: string; version: number },
		expectedVersion: number | null
	) {
		const saved = {
			...milestone,
			version: (this.milestones.get(milestone.id)?.version ?? 0) + 1
		};
		this.milestones.set(saved.id, saved);
		return saved;
	}

	async archive(milestoneId: string, _expectedVersion: number) {
		const m = this.milestones.get(milestoneId);
		if (m) {
			m.status = 'Archived';
			this.archivedIds.push(milestoneId);
		}
	}

	async restoreToOpen(milestoneId: string, _expectedVersion: number) {
		const m = this.milestones.get(milestoneId);
		if (m) {
			m.status = 'Open';
			m.version++;
			this.restoredIds.push(milestoneId);
			return { ...m };
		}
		return undefined;
	}

	async query(_userId: string, _query: unknown) {
		return { items: [...this.milestones.values()], nextCursor: undefined };
	}

	async deleteByAspectIds(aspectIds: string[]) {
		let count = 0;
		for (const [id, m] of this.milestones) {
			if (aspectIds.includes(m.aspectId)) {
				this.milestones.delete(id);
				count++;
			}
		}
		return count;
	}

	seed(m: { id: string; aspectId: string; title: string; status: string; version: number }) {
		this.milestones.set(m.id, { ...m });
	}

	getAll() {
		return [...this.milestones.values()];
	}

	listByAspectId(aspectId: string) {
		return [...this.milestones.values()].filter((milestone) => milestone.aspectId === aspectId);
	}
}

export class FakeReminderRepository {
	private reminders: Map<string, unknown> = new Map();
	public cancelledTaskIds: string[] = [];

	async findById(id: string) {
		return this.reminders.get(id);
	}
	async findActiveByTaskChannel(_taskId: string, _channel: string) {
		return undefined;
	}
	async save(aggregate: { id: string }, _expectedVersion: number | null) {
		this.reminders.set(aggregate.id, aggregate);
		return aggregate;
	}
	async recordAttempt(_reminderId: string, _attemptInput: unknown) {
		return {};
	}
	async queryDue(_now: Date) {
		return [];
	}
	async queryFailedForRetry(_now: Date) {
		return [];
	}
	async cancelPendingForTask(_taskId: string) {
		this.cancelledTaskIds.push(_taskId);
		return 0;
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}
}

export class FakeRecurringSeriesRepository {
	private series: Map<string, unknown> = new Map();

	async findById(id: string) {
		return this.series.get(id);
	}
	async save(aggregate: { id: string }, _expectedVersion: number | null) {
		this.series.set(aggregate.id, aggregate);
		return aggregate;
	}
	async close(id: string, _expectedVersion: number) {
		return this.series.get(id);
	}
	async findByTaskInstance(_taskId: string) {
		return undefined;
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}

	seed(s: { id: string } & Record<string, unknown>) {
		this.series.set(s.id, s);
	}
}

export class FakePlanningCycleRepository {
	private cycles: Map<string, unknown> = new Map();

	async findCycleForWeek(_userId: string, _weekStart: string) {
		for (const cycle of this.cycles.values() as Iterable<any>) {
			if (cycle.cycle.userId === _userId && cycle.cycle.weekStartIsoMonday === _weekStart) {
				return cycle;
			}
		}
		return undefined;
	}
	async findById(id: string) {
		return this.cycles.get(id);
	}
	async createCycleWithRevision(aggregate: { id: string }) {
		const cycleId = (aggregate as any).cycle?.id ?? aggregate.id;
		this.cycles.set(cycleId, aggregate);
		return aggregate as any;
	}
	async createDraftRevision(_cycleId: string, _draftInput: unknown, _expectedVersion: number) {
		return {};
	}
	async confirmCycle(_cycleId: string, _expectedVersion: number) {
		const aggregate = this.cycles.get(_cycleId) as any;
		aggregate.cycle = { ...aggregate.cycle, status: 'Confirmed' };
		this.cycles.set(_cycleId, aggregate);
		return aggregate;
	}
	async supersedeAndCreateRevision(
		_cycleId: string,
		_revisionInput: unknown,
		_expectedVersion: number
	) {
		const aggregate = this.cycles.get(_cycleId) as any;
		const nextRevision = {
			id: (_revisionInput as any).revisionId,
			revisionNumber: aggregate.revisions.length + 1,
			status: 'Active'
		};
		aggregate.revisions = [...aggregate.revisions, nextRevision];
		aggregate.allocations = (_revisionInput as any).allocations ?? [];
		this.cycles.set(_cycleId, aggregate);
		return aggregate;
	}
	async applyPlanEditRevision(_cycleId: string, _editInput: unknown, _expectedVersion: number) {
		const aggregate = this.cycles.get(_cycleId) as any;
		const nextRevision = {
			id: (_editInput as any).newRevisionId,
			revisionNumber: aggregate.revisions.length + 1,
			status: 'Active'
		};
		aggregate.revisions = [...aggregate.revisions, nextRevision];
		this.cycles.set(_cycleId, aggregate);
		return aggregate;
	}
	async persistOutcome(_allocationId: string, _outcomeInput: unknown, _expectedVersion: number) {
		return {};
	}
	async persistHealthScores(_cycleId: string, _scores: unknown[]) {
		const aggregate = this.cycles.get(_cycleId) as any;
		if (aggregate) aggregate.healthScores = _scores;
		return _scores as any;
	}
	async queryCycles(_userId: string, _query: unknown) {
		return { items: [], nextCursor: undefined };
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}

	seed(aggregate: any) {
		this.cycles.set(aggregate.cycle.id, aggregate);
	}
}

export class FakeAuditEventRepository {
	private events: unknown[] = [];

	async append(event: unknown) {
		this.events.push(event);
		return event;
	}
	async queryForUser(_userId: string, _query: unknown) {
		return { items: this.events, nextCursor: undefined };
	}
	async deleteByUserId(_userId: string) {
		this.events = [];
		return 0;
	}

	getAll() {
		return [...this.events];
	}
}

export class FakeImportJobRepository {
	private jobs: Map<string, { id: string; status: string }> = new Map();

	async createRunning(job: { id: string; status: string }) {
		this.jobs.set(job.id, { ...job });
		return job;
	}
	async markSucceeded(jobId: string, _report: unknown) {
		const j = this.jobs.get(jobId);
		if (j) j.status = 'Succeeded';
		return j;
	}
	async markFailed(jobId: string, _reason: string) {
		const j = this.jobs.get(jobId);
		if (j) j.status = 'Failed';
		return j;
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}
}

export class FakeIdempotencyKeyRepository {
	private keys: Map<string, unknown> = new Map();

	async findByUserCommandKey(_userId: string, _commandName: string, keyHash: string) {
		return this.keys.get(keyHash);
	}
	async saveFirstResponse(record: { keyHash: string }) {
		this.keys.set(record.keyHash, record);
		return record;
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}
}

export class FakeSystemJobRunRepository {
	private runs: Map<string, unknown> = new Map();

	async findByJobRunKey(_jobName: string, keyHash: string) {
		return this.runs.get(keyHash);
	}
	async saveFirstResult(run: { jobRunKeyHash: string }) {
		this.runs.set(run.jobRunKeyHash, run);
		return run;
	}
}

export class FakeAvailabilityRepository {
	private blocks: Map<string, unknown> = new Map();

	async findById(id: string) {
		return this.blocks.get(id);
	}
	async save(aggregate: { id: string }, _expectedVersion: number | null) {
		this.blocks.set(aggregate.id, aggregate);
		return aggregate;
	}
	async archive(_blockId: string, _expectedVersion: number) {}
	async restore(_blockId: string, _expectedVersion: number) {
		return {};
	}
	async addException(_blockId: string, _exceptionInput: unknown) {
		return {};
	}
	async queryLiveBlocksForRange(_userId: string, _range: unknown) {
		return [];
	}
	async deleteByUserId(_userId: string) {
		return 0;
	}
}
