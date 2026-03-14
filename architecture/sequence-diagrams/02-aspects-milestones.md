# Aspect and Milestone Sequences

All sequences assume principal validation before the first domain read or mutation.

<a id="ASP-01"></a>

## ASP-01 Create Draft Aspect

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    U->>A: Create aspect(name, purpose)
    alt missing required metadata
        A-->>U: VALIDATION_FAILED
    else valid create
        A->>A: Set status Draft
        A-->>U: Aspect created
    end
```

<a id="ASP-02"></a>

## ASP-02 Activate Aspect

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    U->>A: Activate aspect(target %)
    alt aspect not owned by user
        A-->>U: OWNERSHIP_VIOLATION
    else stale version
        A-->>U: CONFLICT_STALE_WRITE
    else status is not Draft
        A-->>U: STATE_TRANSITION_INVALID
    else target or metadata invalid
        A-->>U: VALIDATION_FAILED
    else valid activation
        A->>A: Set status Active
        A-->>U: Aspect activated
    end
```

<a id="ASP-03"></a>

## ASP-03 Update Aspect

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    U->>A: Update metadata or target percentage
    alt aspect not found
        A-->>U: NOT_FOUND
    else aspect not owned by user
        A-->>U: OWNERSHIP_VIOLATION
    else stale version
        A-->>U: CONFLICT_STALE_WRITE
    else update violates field constraints
        A-->>U: VALIDATION_FAILED
    else valid update
        A->>A: Persist update
        A-->>U: Aspect updated
    end
```

<a id="ASP-04"></a>

## ASP-04 Archive Aspect

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    participant M as Milestone
    participant T as Task
    participant R as Reminder
    participant P as PlanningCycle
    U->>A: Archive aspect
    alt aspect not found
        A-->>U: NOT_FOUND
    else aspect already archived
        A-->>U: STATE_TRANSITION_INVALID
    else stale version
        A-->>U: CONFLICT_STALE_WRITE
    else valid archive
        A->>A: Set status Archived
        A->>M: Archive child milestones
        M->>T: Archive child tasks and recurring series anchors
        T->>R: Cancel pending reminders
        T->>P: Cancel future allocations
        A-->>U: Aspect archived with cascade
    end
```

<a id="ASP-05"></a>

## ASP-05 Restore Aspect

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    participant M as Milestone
    participant T as Task
    U->>A: Restore aspect
    alt aspect not found
        A-->>U: NOT_FOUND
    else aspect is not Archived
        A-->>U: STATE_TRANSITION_INVALID
    else stale version
        A-->>U: CONFLICT_STALE_WRITE
    else valid restore
        A->>A: Reset status to Draft
        Note over M,T: Descendants remain archived until explicitly restored
        A-->>U: Aspect restored
    end
```

<a id="ASP-06"></a>

## ASP-06 Query Aspects

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    U->>A: List aspects(status/date filters, cursor)
    alt cursor does not match query shape
        A-->>U: QUERY_CURSOR_INVALID
    else valid query
        A->>A: Apply filters and cursor binding
        A-->>U: Paged aspects
    end
```

<a id="MLS-01"></a>

## MLS-01 Create Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    participant M as Milestone
    U->>M: Create milestone in aspect
    M->>A: Validate aspect is active and owned
    alt aspect not found
        M-->>U: NOT_FOUND
    else aspect not active
        M-->>U: VALIDATION_FAILED
    else valid create
        M->>M: Set status Open
        M-->>U: Milestone created
    end
```

<a id="MLS-02"></a>

## MLS-02 Update Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    U->>M: Update title, description, target date
    alt milestone not found
        M-->>U: NOT_FOUND
    else stale version
        M-->>U: CONFLICT_STALE_WRITE
    else invalid metadata
        M-->>U: VALIDATION_FAILED
    else valid update
        M->>M: Persist changes
        M-->>U: Milestone updated
    end
```

<a id="MLS-03"></a>

## MLS-03 Complete Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    participant T as Task
    U->>M: Mark milestone Done
    M->>T: Check all child tasks are Done
    alt milestone not found
        M-->>U: NOT_FOUND
    else milestone not owned by user
        M-->>U: OWNERSHIP_VIOLATION
    else stale version
        M-->>U: CONFLICT_STALE_WRITE
    else any child task not done
        M-->>U: STATE_TRANSITION_INVALID
    else valid completion
        M->>M: Set status Done
        M-->>U: Milestone completed
    end
```

<a id="MLS-04"></a>

## MLS-04 Reopen Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    U->>M: Reopen milestone
    alt milestone not found
        M-->>U: NOT_FOUND
    else milestone not owned by user
        M-->>U: OWNERSHIP_VIOLATION
    else milestone status is not Done
        M-->>U: STATE_TRANSITION_INVALID
    else stale version
        M-->>U: CONFLICT_STALE_WRITE
    else valid reopen
        M->>M: Set status Done to Open
        M-->>U: Milestone reopened
    end
```

<a id="MLS-05"></a>

## MLS-05 Archive Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    participant T as Task
    U->>M: Archive milestone
    alt milestone not found
        M-->>U: NOT_FOUND
    else milestone already archived
        M-->>U: STATE_TRANSITION_INVALID
    else stale version
        M-->>U: CONFLICT_STALE_WRITE
    else valid archive
        M->>M: Set status Archived
        M->>T: Archive child tasks and recurring series anchors
        M-->>U: Milestone archived
    end
```

<a id="MLS-06"></a>

## MLS-06 Restore Milestone

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    U->>M: Restore milestone
    alt milestone not found
        M-->>U: NOT_FOUND
    else milestone is not Archived
        M-->>U: STATE_TRANSITION_INVALID
    else stale version
        M-->>U: CONFLICT_STALE_WRITE
    else valid restore
        M->>M: Reset status to Open
        M-->>U: Milestone restored
    end
```

<a id="MLS-07"></a>

## MLS-07 Query Milestones

```mermaid
sequenceDiagram
    actor U as User
    participant M as Milestone
    U->>M: List milestones(aspect, status, date, cursor)
    alt cursor does not match query shape
        M-->>U: QUERY_CURSOR_INVALID
    else valid query
        M->>M: Apply query and cursor binding
        M-->>U: Paged milestones
    end
```
