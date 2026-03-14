# Execution and Reminder Sequences

All sequences assume principal validation before the first domain read or mutation.

<a id="EXE-01"></a>

## EXE-01 Mark Allocation Outcome

```mermaid
sequenceDiagram
    actor U as User
    participant A as TaskAllocation
    participant O as AllocationOutcome
    U->>A: Mark attended or missed
    alt allocation not found
        A-->>U: NOT_FOUND
    else allocation not owned by user
        A-->>U: OWNERSHIP_VIOLATION
    else stale version
        A-->>U: CONFLICT_STALE_WRITE
    else invalid outcome payload
        A-->>U: VALIDATION_FAILED
    else valid outcome
        A->>O: Persist single outcome record
        O-->>U: Outcome recorded
    end
```

<a id="EXE-02"></a>

## EXE-02 Compute Aspect Health

```mermaid
sequenceDiagram
    actor J as HealthJob
    participant C as PlanningCycle
    participant O as AllocationOutcome
    participant H as AspectCycleHealth
    J->>C: Compute health for cycle
    C->>O: Aggregate attended allocation minutes by aspect
    C->>H: Compute completed vs target health score
    H-->>J: Health persisted
```

<a id="REM-01"></a>

## REM-01 Create or Update Reminder

```mermaid
sequenceDiagram
    actor U as User
    participant T as Task
    participant R as Reminder
    U->>R: Upsert reminder(remind_at, channel)
    R->>T: Validate task ownership and state
    alt task missing or terminal
        R-->>U: NOT_FOUND
    else stale version
        R-->>U: CONFLICT_STALE_WRITE
    else channel or datetime invalid
        R-->>U: VALIDATION_FAILED
    else valid upsert
        R->>R: Replace or create the active reminder for that channel
        R->>R: Set status Pending
        R-->>U: Reminder saved
    end
```

<a id="REM-02"></a>

## REM-02 Snooze Reminder

```mermaid
sequenceDiagram
    actor U as User
    participant R as Reminder
    U->>R: Snooze reminder(duration)
    alt reminder not found
        R-->>U: NOT_FOUND
    else reminder not owned by user
        R-->>U: OWNERSHIP_VIOLATION
    else stale version
        R-->>U: CONFLICT_STALE_WRITE
    else reminder is not Pending
        R-->>U: STATE_TRANSITION_INVALID
    else snooze count exceeds policy
        R-->>U: SNOOZE_LIMIT_EXCEEDED
    else valid snooze
        R->>R: Increment snooze count and push remind_at
        R-->>U: Reminder snoozed
    end
```

<a id="REM-03"></a>

## REM-03 Reminder Dispatch Job

```mermaid
sequenceDiagram
    actor J as ReminderJob
    participant R as Reminder
    participant A as ReminderAttempt
    J->>R: Fetch reminders due now
    loop each due reminder
        J->>A: Record delivery attempt
        alt delivery success
            R->>R: Set status Sent
        else exponential retries remain
            R->>R: Keep status Pending and schedule next retry at 15, 30, 60, 120, or 240 minutes
        else retry policy exhausted
            R->>R: Set status Failed and enqueue for daily retry processing
            R-->>J: RETRY_EXHAUSTED
        end
    end
    R-->>J: Dispatch summary
```

<a id="REM-04"></a>

## REM-04 Retry Exhaustion and Terminal Failure

```mermaid
sequenceDiagram
    actor J as RetryJob
    participant R as Reminder
    J->>R: Process failed reminders
    alt daily retry window still open
        R->>R: Queue next daily retry and return to Pending
        R-->>J: Retry scheduled
    else retry age exceeds 30 days
        R->>R: Set status Failed terminally
        R-->>J: RETRY_EXHAUSTED
    end
```
