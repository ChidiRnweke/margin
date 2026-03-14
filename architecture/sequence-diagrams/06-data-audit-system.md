# Data, Audit, and System Sequences

All sequences assume principal validation before the first domain read or mutation.

<a id="DAT-01"></a>

## DAT-01 Export JSON

```mermaid
sequenceDiagram
    actor U as User
    participant E as ExportJob
    participant P as PlanningProfile
    participant X as Aspect
    participant S as RecurringTaskSeries
    participant T as Task
    participant V as AvailabilityBlock
    participant C as PlanningCycle
    participant R as Reminder
    U->>E: Start export
    E->>P: Collect planning profile
    E->>X: Collect aspects and milestones
    E->>S: Collect recurring series, rules, and exceptions
    E->>T: Collect tasks, locks, and related live state
    E->>V: Collect availability and exceptions
    E->>C: Collect planning cycles, revisions, allocations, outcomes, and health
    E->>R: Collect reminders and attempts
    Note over E: Exclude audit events, sessions, idempotency keys, and operational jobs
    E-->>U: JSON export artifact ready
```

<a id="DAT-02"></a>

## DAT-02 Import JSON with ID Remap

```mermaid
sequenceDiagram
    actor U as User
    participant I as ImportJob
    participant P as PlanningProfile
    participant X as Aspect
    participant S as RecurringTaskSeries
    participant T as Task
    participant V as AvailabilityBlock
    participant C as PlanningCycle
    participant R as Reminder
    U->>I: Import JSON payload
    alt schema invalid or forbidden entity included
        I-->>U: VALIDATION_FAILED
    else remap fails
        I-->>U: IMPORT_CONFLICT_REMAP_FAILED
    else valid payload
        I->>I: Remap conflicting IDs and references
        I->>P: Persist planning profile
        I->>X: Persist remapped aspects and milestones
        I->>S: Persist remapped recurring series, rules, and exceptions
        I->>T: Persist remapped tasks and locks
        I->>V: Persist remapped availability and exceptions
        I->>C: Persist remapped plans, revisions, allocations, outcomes, and health
        I->>R: Persist remapped reminders and attempts
        Note over I: Audit history is never recreated from import
        I-->>U: Import report with remap counts
    end
```

<a id="AUD-01"></a>

## AUD-01 Emit Audit Event on Write

```mermaid
sequenceDiagram
    actor U as User
    participant T as Task
    participant A as AuditEvent
    U->>T: Apply successful mutation
    T->>A: Emit redacted before and after diff with actor metadata
    A->>A: Persist immutable event in user's timeline
```

<a id="AUD-02"></a>

## AUD-02 Query Audit Timeline

```mermaid
sequenceDiagram
    actor U as User
    participant A as AuditEvent
    U->>A: List audit events(cursor)
    alt cursor does not match query shape
        A-->>U: QUERY_CURSOR_INVALID
    else valid query
        A->>A: Apply cursor and ownership filter
        A-->>U: Paged immutable timeline
    end
```

<a id="SYS-01"></a>

## SYS-01 Idempotent Command Handling

```mermaid
sequenceDiagram
    actor U as User
    participant K as IdempotencyKey
    participant T as Task
    U->>K: Submit mutating command with idempotency key and request hash
    alt key and hash already exist
        K-->>U: Prior response reference
    else key exists with different hash
        K-->>U: IDEMPOTENCY_HASH_MISMATCH
    else first execution
        K->>T: Allow mutation to execute
        T->>K: Persist key, request hash, and response reference
        K-->>U: New response reference
    end
```

<a id="SYS-02"></a>

## SYS-02 Idempotent Job Handling

```mermaid
sequenceDiagram
    actor J as MutationCapableJob
    participant K as SystemJobRun
    participant R as Reminder
    J->>K: Submit job with job-run key and request hash
    alt key and hash already exist
        K-->>J: Prior job result
    else key exists with different hash
        K-->>J: IDEMPOTENCY_HASH_MISMATCH
    else first execution
        K->>R: Allow job mutation to execute safely
        R->>K: Persist job-run key, request hash, and result
        K-->>J: New job result
    end
```
