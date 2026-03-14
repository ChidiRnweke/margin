# Execution and Reminder Sequences

<a id="EXE-01"></a>
## EXE-01 Mark Allocation Outcome

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as TaskAllocation
    participant O as AllocationOutcome
    U->>A: Mark attended or missed
    A->>O: Persist outcome
    O-->>U: Outcome recorded
```

<a id="EXE-02"></a>
## EXE-02 Compute Aspect Health

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Health Job
    participant C as PlanningCycle
    participant A as AllocationOutcome
    participant H as AspectCycleHealth
    J->>C: Compute health for cycle
    C->>A: Aggregate attended minutes by aspect
    C->>H: Compute completed vs target health score
    H-->>J: Health persisted
```

<a id="REM-01"></a>
## REM-01 Create or Update Reminder

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant R as Reminder
    U->>R: Upsert reminder(remind_at, channel)
    R->>T: Validate task ownership and state
    R->>R: Set status Pending
    R-->>U: Reminder saved
```

<a id="REM-02"></a>
## REM-02 Snooze Reminder

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant R as Reminder
    U->>R: Snooze reminder(duration)
    R->>R: Validate snooze bound
    alt within bound
      R->>R: Increment snooze count and push remind_at
      R-->>U: Reminder snoozed
    else exceeded bound
      R-->>U: STATE_TRANSITION_INVALID
    end
```

<a id="REM-03"></a>
## REM-03 Reminder Dispatch Job

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Reminder Job
    participant R as Reminder
    participant A as ReminderAttempt
    J->>R: Fetch reminders due now
    loop each due reminder
      J->>A: Record delivery attempt
      alt delivery success
        R->>R: Set status Sent
      else delivery failure
        R->>R: Schedule exponential retry
      end
    end
    R-->>J: Dispatch summary
```

<a id="REM-04"></a>
## REM-04 Retry Exhaustion and Terminal Failure

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Retry Job
    participant R as Reminder
    J->>R: Process failed reminders
    alt failure age <= 30 days
      R->>R: Queue daily retry
      R-->>J: Retry scheduled
    else failure age > 30 days
      R->>R: Set status Failed terminally
      R-->>J: Terminal failure recorded
    end
```
