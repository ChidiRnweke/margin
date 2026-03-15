import type { Database } from '$lib/server/db/index.js';

// Repositories
import { PostgresUserRepository } from '$lib/server/repositories/postgres/user-repository.js';
import { PostgresSessionRepository } from '$lib/server/repositories/postgres/session-repository.js';
import { PostgresPlanningProfileRepository } from '$lib/server/repositories/postgres/planning-profile-repository.js';
import { PostgresAspectRepository } from '$lib/server/repositories/postgres/aspect-repository.js';
import { PostgresMilestoneRepository } from '$lib/server/repositories/postgres/milestone-repository.js';
import { PostgresTaskRepository } from '$lib/server/repositories/postgres/task-repository.js';
import { PostgresRecurringSeriesRepository } from '$lib/server/repositories/postgres/recurring-series-repository.js';
import { PostgresReminderRepository } from '$lib/server/repositories/postgres/reminder-repository.js';
import { PostgresAvailabilityRepository } from '$lib/server/repositories/postgres/availability-repository.js';
import { PostgresPlanningCycleRepository } from '$lib/server/repositories/postgres/planning-cycle-repository.js';
import { PostgresImportJobRepository } from '$lib/server/repositories/postgres/import-job-repository.js';
import { PostgresAuditEventRepository } from '$lib/server/repositories/postgres/audit-event-repository.js';
import { PostgresIdempotencyKeyRepository } from '$lib/server/repositories/postgres/idempotency-key-repository.js';
import { PostgresSystemJobRunRepository } from '$lib/server/repositories/postgres/system-job-run-repository.js';

// Infra
import { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import { CommandIdempotencyPolicy } from '$lib/server/infra/idempotency/command-policy.js';
import { JobIdempotencyPolicy } from '$lib/server/infra/idempotency/job-policy.js';
import { DevIdentityProvider } from '$lib/server/infra/providers/dev-provider.js';
import { InAppReminderProvider } from '$lib/server/infra/providers/in-app-reminder-provider.js';
import { EmailReminderProvider } from '$lib/server/infra/providers/email-reminder-provider.js';

// Internal services
import { IdentityProviderGatewayAdapter } from '$lib/server/services/internal/identity-provider-gateway.js';
import { AccountErasureService } from '$lib/server/services/internal/account-erasure-service.js';
import { RecurrenceMaterializer } from '$lib/server/services/internal/recurrence-materializer.js';
import { AvailabilityWindowResolver } from '$lib/server/services/internal/availability-window-resolver.js';
import { SchedulerEngine } from '$lib/server/services/internal/scheduler-engine.js';
import { ImportRemapService } from '$lib/server/services/internal/import-remap-service.js';
import { HealthComputationService } from '$lib/server/services/internal/health-computation-service.js';
import { ReminderDispatchService } from '$lib/server/services/internal/reminder-dispatch-service.js';

// Services
import { AuthService } from '$lib/server/services/auth-service.js';
import { ProfileService } from '$lib/server/services/profile-service.js';
import { AspectService } from '$lib/server/services/aspect-service.js';
import { MilestoneService } from '$lib/server/services/milestone-service.js';
import { TaskService } from '$lib/server/services/task-service.js';
import { RecurrenceService } from '$lib/server/services/recurrence-service.js';
import { AvailabilityService } from '$lib/server/services/availability-service.js';
import { PlanningService } from '$lib/server/services/planning-service.js';
import { ExecutionService } from '$lib/server/services/execution-service.js';
import { ReminderService } from '$lib/server/services/reminder-service.js';
import { DataPortabilityService } from '$lib/server/services/data-portability-service.js';
import { AuditQueryService } from '$lib/server/services/audit-query-service.js';

// Controllers
import { AuthController } from '$lib/server/controllers/auth-controller.js';
import { ProfileController } from '$lib/server/controllers/profile-controller.js';
import { AspectController } from '$lib/server/controllers/aspect-controller.js';
import { MilestoneController } from '$lib/server/controllers/milestone-controller.js';
import { TaskController } from '$lib/server/controllers/task-controller.js';
import { RecurrenceController } from '$lib/server/controllers/recurrence-controller.js';
import { AvailabilityController } from '$lib/server/controllers/availability-controller.js';
import { PlanningController } from '$lib/server/controllers/planning-controller.js';
import { ExecutionController } from '$lib/server/controllers/execution-controller.js';
import { ReminderController } from '$lib/server/controllers/reminder-controller.js';
import { DataPortabilityController } from '$lib/server/controllers/data-portability-controller.js';
import { AuditController } from '$lib/server/controllers/audit-controller.js';

const DEFAULT_CALLBACK_URL = '/auth/callback';

export class AppFactory {
	// Repositories
	private _userRepo?: PostgresUserRepository;
	private _sessionRepo?: PostgresSessionRepository;
	private _profileRepo?: PostgresPlanningProfileRepository;
	private _aspectRepo?: PostgresAspectRepository;
	private _milestoneRepo?: PostgresMilestoneRepository;
	private _taskRepo?: PostgresTaskRepository;
	private _recurringSeriesRepo?: PostgresRecurringSeriesRepository;
	private _reminderRepo?: PostgresReminderRepository;
	private _availabilityRepo?: PostgresAvailabilityRepository;
	private _planningCycleRepo?: PostgresPlanningCycleRepository;
	private _importJobRepo?: PostgresImportJobRepository;
	private _auditEventRepo?: PostgresAuditEventRepository;
	private _idempotencyKeyRepo?: PostgresIdempotencyKeyRepository;
	private _systemJobRunRepo?: PostgresSystemJobRunRepository;

	// Infra
	private _auditEmitter?: AuditEmitter;
	private _commandIdempotencyPolicy?: CommandIdempotencyPolicy;
	private _jobIdempotencyPolicy?: JobIdempotencyPolicy;
	private _devIdentityProvider?: DevIdentityProvider;
	private _inAppReminderProvider?: InAppReminderProvider;
	private _emailReminderProvider?: EmailReminderProvider;

	// Internal services
	private _identityGateway?: IdentityProviderGatewayAdapter;
	private _accountErasure?: AccountErasureService;
	private _recurrenceMaterializer?: RecurrenceMaterializer;
	private _windowResolver?: AvailabilityWindowResolver;
	private _schedulerEngine?: SchedulerEngine;
	private _importRemapService?: ImportRemapService;
	private _healthComputation?: HealthComputationService;
	private _reminderDispatch?: ReminderDispatchService;

	// Services
	private _authService?: AuthService;
	private _profileService?: ProfileService;
	private _aspectService?: AspectService;
	private _milestoneService?: MilestoneService;
	private _taskService?: TaskService;
	private _recurrenceService?: RecurrenceService;
	private _availabilityService?: AvailabilityService;
	private _planningService?: PlanningService;
	private _executionService?: ExecutionService;
	private _reminderService?: ReminderService;
	private _dataPortabilityService?: DataPortabilityService;
	private _auditQueryService?: AuditQueryService;

	// Controllers
	private _authController?: AuthController;
	private _profileController?: ProfileController;
	private _aspectController?: AspectController;
	private _milestoneController?: MilestoneController;
	private _taskController?: TaskController;
	private _recurrenceController?: RecurrenceController;
	private _availabilityController?: AvailabilityController;
	private _planningController?: PlanningController;
	private _executionController?: ExecutionController;
	private _reminderController?: ReminderController;
	private _dataPortabilityController?: DataPortabilityController;
	private _auditController?: AuditController;

	constructor(private db: Database) {}

	static create(db: Database): AppFactory {
		return new AppFactory(db);
	}

	// ── Repositories ──

	get userRepo() {
		return (this._userRepo ??= new PostgresUserRepository(this.db));
	}
	get sessionRepo() {
		return (this._sessionRepo ??= new PostgresSessionRepository(this.db));
	}
	get profileRepo() {
		return (this._profileRepo ??= new PostgresPlanningProfileRepository(this.db));
	}
	get aspectRepo() {
		return (this._aspectRepo ??= new PostgresAspectRepository(this.db));
	}
	get milestoneRepo() {
		return (this._milestoneRepo ??= new PostgresMilestoneRepository(this.db));
	}
	get taskRepo() {
		return (this._taskRepo ??= new PostgresTaskRepository(this.db));
	}
	get recurringSeriesRepo() {
		return (this._recurringSeriesRepo ??= new PostgresRecurringSeriesRepository(this.db));
	}
	get reminderRepo() {
		return (this._reminderRepo ??= new PostgresReminderRepository(this.db));
	}
	get availabilityRepo() {
		return (this._availabilityRepo ??= new PostgresAvailabilityRepository(this.db));
	}
	get planningCycleRepo() {
		return (this._planningCycleRepo ??= new PostgresPlanningCycleRepository(this.db));
	}
	get importJobRepo() {
		return (this._importJobRepo ??= new PostgresImportJobRepository(this.db));
	}
	get auditEventRepo() {
		return (this._auditEventRepo ??= new PostgresAuditEventRepository(this.db));
	}
	get idempotencyKeyRepo() {
		return (this._idempotencyKeyRepo ??= new PostgresIdempotencyKeyRepository(this.db));
	}
	get systemJobRunRepo() {
		return (this._systemJobRunRepo ??= new PostgresSystemJobRunRepository(this.db));
	}

	// ── Infra ──

	get auditEmitter() {
		return (this._auditEmitter ??= new AuditEmitter(this.auditEventRepo));
	}
	get commandIdempotencyPolicy() {
		return (this._commandIdempotencyPolicy ??= new CommandIdempotencyPolicy(
			this.idempotencyKeyRepo
		));
	}
	get jobIdempotencyPolicy() {
		return (this._jobIdempotencyPolicy ??= new JobIdempotencyPolicy(this.systemJobRunRepo));
	}
	get identityProvider() {
		return (this._devIdentityProvider ??= new DevIdentityProvider());
	}
	get inAppReminderProvider() {
		return (this._inAppReminderProvider ??= new InAppReminderProvider());
	}
	get emailReminderProvider() {
		return (this._emailReminderProvider ??= new EmailReminderProvider());
	}

	// ── Internal Services ──

	get identityGateway() {
		return (this._identityGateway ??= new IdentityProviderGatewayAdapter(
			this.identityProvider,
			DEFAULT_CALLBACK_URL
		));
	}
	get accountErasure() {
		return (this._accountErasure ??= new AccountErasureService(
			this.userRepo,
			this.sessionRepo,
			this.aspectRepo,
			this.milestoneRepo,
			this.taskRepo,
			this.recurringSeriesRepo,
			this.availabilityRepo,
			this.planningCycleRepo,
			this.reminderRepo,
			this.auditEventRepo,
			this.idempotencyKeyRepo,
			this.importJobRepo
		));
	}
	get recurrenceMaterializer() {
		return (this._recurrenceMaterializer ??= new RecurrenceMaterializer(
			this.recurringSeriesRepo,
			this.taskRepo
		));
	}
	get windowResolver() {
		return (this._windowResolver ??= new AvailabilityWindowResolver());
	}
	get schedulerEngine() {
		return (this._schedulerEngine ??= new SchedulerEngine());
	}
	get importRemapService() {
		return (this._importRemapService ??= new ImportRemapService());
	}
	get healthComputation() {
		return (this._healthComputation ??= new HealthComputationService(
			this.planningCycleRepo,
			this.aspectRepo
		));
	}
	get reminderDispatch() {
		return (this._reminderDispatch ??= new ReminderDispatchService(
			this.reminderRepo,
			this.taskRepo,
			this.inAppReminderProvider,
			this.emailReminderProvider
		));
	}

	// ── Services ──

	get authService() {
		return (this._authService ??= new AuthService(
			this.userRepo,
			this.sessionRepo,
			this.profileRepo,
			this.aspectRepo,
			this.identityGateway,
			this.accountErasure,
			this.auditEmitter
		));
	}
	get profileService() {
		return (this._profileService ??= new ProfileService(
			this.profileRepo,
			this.aspectRepo,
			this.auditEmitter
		));
	}
	get aspectService() {
		return (this._aspectService ??= new AspectService(
			this.aspectRepo,
			this.milestoneRepo,
			this.taskRepo,
			this.auditEmitter
		));
	}
	get milestoneService() {
		return (this._milestoneService ??= new MilestoneService(
			this.milestoneRepo,
			this.aspectRepo,
			this.auditEmitter
		));
	}
	get taskService() {
		return (this._taskService ??= new TaskService(
			this.taskRepo,
			this.aspectRepo,
			this.milestoneRepo,
			this.recurrenceMaterializer,
			this.auditEmitter
		));
	}
	get recurrenceService() {
		return (this._recurrenceService ??= new RecurrenceService(
			this.recurringSeriesRepo,
			this.taskRepo,
			this.aspectRepo,
			this.auditEmitter
		));
	}
	get availabilityService() {
		return (this._availabilityService ??= new AvailabilityService(
			this.availabilityRepo,
			this.userRepo,
			this.windowResolver,
			this.auditEmitter
		));
	}
	get planningService() {
		return (this._planningService ??= new PlanningService(
			this.planningCycleRepo,
			this.taskRepo,
			this.availabilityRepo,
			this.profileRepo,
			this.aspectRepo,
			this.userRepo,
			this.schedulerEngine,
			this.windowResolver,
			this.auditEmitter
		));
	}
	get executionService() {
		return (this._executionService ??= new ExecutionService(
			this.planningCycleRepo,
			this.auditEmitter
		));
	}
	get reminderService() {
		return (this._reminderService ??= new ReminderService(this.reminderRepo, this.auditEmitter));
	}
	get dataPortabilityService() {
		return (this._dataPortabilityService ??= new DataPortabilityService(
			this.userRepo,
			this.aspectRepo,
			this.taskRepo,
			this.importJobRepo,
			this.importRemapService
		));
	}
	get auditQueryService() {
		return (this._auditQueryService ??= new AuditQueryService(this.auditEventRepo));
	}

	// ── Controllers ──

	get authController() {
		return (this._authController ??= new AuthController(this.authService, this.identityGateway));
	}
	get profileController() {
		return (this._profileController ??= new ProfileController(this.profileService));
	}
	get aspectController() {
		return (this._aspectController ??= new AspectController(this.aspectService));
	}
	get milestoneController() {
		return (this._milestoneController ??= new MilestoneController(this.milestoneService));
	}
	get taskController() {
		return (this._taskController ??= new TaskController(this.taskService));
	}
	get recurrenceController() {
		return (this._recurrenceController ??= new RecurrenceController(this.recurrenceService));
	}
	get availabilityController() {
		return (this._availabilityController ??= new AvailabilityController(
			this.availabilityService
		));
	}
	get planningController() {
		return (this._planningController ??= new PlanningController(this.planningService));
	}
	get executionController() {
		return (this._executionController ??= new ExecutionController(this.executionService));
	}
	get reminderController() {
		return (this._reminderController ??= new ReminderController(this.reminderService));
	}
	get dataPortabilityController() {
		return (this._dataPortabilityController ??= new DataPortabilityController(
			this.dataPortabilityService
		));
	}
	get auditController() {
		return (this._auditController ??= new AuditController(this.auditQueryService));
	}
}
