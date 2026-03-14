# Availability and Planning Sequences

All sequences assume principal validation before the first domain read or mutation.

<a id="AVL-01"></a>

## AVL-01 Create One-Off Availability Block

```mermaid
sequenceDiagram
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Create one-off block(start, end)
    alt start is not before end
        B-->>U: VALIDATION_FAILED
    else valid create
        B->>B: Persist one-off block
        B-->>U: Block created
    end
```

<a id="AVL-02"></a>

## AVL-02 Create Recurring Availability Block

```mermaid
sequenceDiagram
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Create recurring block(rule, start, end)
    alt recurrence shape or duration invalid
        B-->>U: VALIDATION_FAILED
    else valid create
        B->>B: Persist recurring template
        B-->>U: Recurring block created
    end
```

<a id="AVL-03"></a>

## AVL-03 Add Recurring Exception

```mermaid
sequenceDiagram
    actor U as User
    participant B as AvailabilityBlock
    participant E as AvailabilityException
    U->>E: Add skip or override for date
    E->>B: Validate block ownership and existence
    alt block missing
        E-->>U: NOT_FOUND
    else block not owned by user
        E-->>U: OWNERSHIP_VIOLATION
    else invalid override shape
        E-->>U: VALIDATION_FAILED
    else valid exception
        E->>E: Persist exception
        E-->>U: Exception saved
    end
```

<a id="AVL-04"></a>

## AVL-04 Update, Archive, Restore Availability

```mermaid
sequenceDiagram
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Update, archive, or restore block
    alt block not found
        B-->>U: NOT_FOUND
    else stale version
        B-->>U: CONFLICT_STALE_WRITE
    else invalid lifecycle change
        B-->>U: STATE_TRANSITION_INVALID
    else invalid time shape
        B-->>U: VALIDATION_FAILED
    else valid change
        B->>B: Apply lifecycle or field mutation
        B-->>U: Availability updated
    end
```

<a id="AVL-05"></a>

## AVL-05 Query Effective Availability

```mermaid
sequenceDiagram
    actor U as User
    participant B as AvailabilityBlock
    participant E as AvailabilityException
    U->>B: Query effective availability(range)
    B->>E: Apply exceptions to recurring blocks
    B->>B: Merge overlaps into derived effective windows
    B-->>U: Effective availability
```

<a id="PLN-01"></a>

## PLN-01 Generate Draft Weekly Plan

```mermaid
sequenceDiagram
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant T as Task
    participant B as AvailabilityBlock
    participant P as PlanningProfile
    participant L as TaskLock
    participant A as TaskAllocation
    U->>C: Generate plan for ISO week
    alt active aspect targets do not total 100
        C-->>U: TARGET_PERCENT_TOTAL_INVALID
    else valid target distribution
        C->>T: Load feasible open tasks
        C->>B: Load effective availability
        C->>P: Load scoring profile
        C->>L: Load active locks
        alt active lock makes a user-forced slot impossible
            C-->>U: LOCK_CONFLICT
        else feasible draft
            Note over C: Due feasibility means all remaining minutes must fit by the end of the task's due local date
            Note over C: Splittable tasks may use multiple windows respecting min chunk; non-splittable tasks must fit contiguously
            Note over C: v1 uses a deterministic heuristic scheduler, not an exact optimization solver
            C->>C: Rank feasible tasks by weighted score and greedily assign earliest valid windows under hard constraints
            Note over C: Lower-ranked feasible tasks may be deferred when capacity is insufficient
            C->>R: Create new active draft revision and supersede prior draft revision if present
            R->>A: Create proposed allocations for scheduled subset
            C-->>U: Draft cycle, revision, deferred set, and allocations
        end
    end
```

<a id="PLN-02"></a>

## PLN-02 Confirm Draft Plan

```mermaid
sequenceDiagram
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant A as TaskAllocation
    U->>C: Confirm draft cycle
    alt cycle not found
        C-->>U: NOT_FOUND
    else stale version
        C-->>U: CONFLICT_STALE_WRITE
    else cycle already confirmed without newer draft revision
        C-->>U: STATE_TRANSITION_INVALID
    else active targets drift from 100
        C-->>U: TARGET_PERCENT_TOTAL_INVALID
    else valid confirmation
        C->>C: Set cycle status Confirmed
        C->>R: Mark current revision Active
        C->>A: Mark proposed allocations Confirmed
        C-->>U: Plan confirmed
    end
```

<a id="PLN-03"></a>

## PLN-03 Regenerate Confirmed Plan

```mermaid
sequenceDiagram
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant A as TaskAllocation
    participant L as TaskLock
    U->>C: Regenerate confirmed cycle
    alt cycle not found
        C-->>U: NOT_FOUND
    else stale version
        C-->>U: CONFLICT_STALE_WRITE
    else cycle is not Confirmed
        C-->>U: STATE_TRANSITION_INVALID
    else lock constraints are impossible to preserve
        C-->>U: LOCK_CONFLICT
    else valid regeneration
        Note over C: Preserve past allocations and active locks
        Note over C: Reoptimize only future unlocked allocations
        C->>R: Mark current revision Superseded
        C->>R: Create next revision as Active
        R->>A: Generate replacement allocations
        C->>C: Update current revision pointer
        C-->>U: New active revision in same cycle
    end
```

<a id="PLN-04"></a>

## PLN-04 Edit Allocation, Lock, Unlock, Cancel

```mermaid
sequenceDiagram
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant A as TaskAllocation
    participant L as TaskLock
    U->>C: Edit allocation or lock, unlock, or cancel
    alt cycle or revision missing
        C-->>U: NOT_FOUND
    else stale version
        C-->>U: CONFLICT_STALE_WRITE
    else requested lock conflicts with existing active lock
        L-->>U: LOCK_CONFLICT
    else invalid lifecycle mutation
        C-->>U: STATE_TRANSITION_INVALID
    else valid edit
        C->>R: Create next revision as Active
        R->>L: Create or release exact-time lock
        R->>A: Apply allocation mutation
        C->>R: Supersede previously current revision
        C->>C: Update current revision pointer
        R-->>U: Revised plan snapshot
    end
```

<a id="PLN-05"></a>

## PLN-05 Day-Boundary Replan Job

```mermaid
sequenceDiagram
    actor J as ReplanJob
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant T as Task
    J->>C: Replan active cycles at day boundary
    C->>T: Refresh overdue and feasibility state
    alt no material change
        C-->>J: No-op
    else lock-preserving revision can be created
        Note over C: Preserve past allocations and active locks
        Note over C: Reoptimize only future unlocked allocations
        C->>R: Create superseding revision
        C->>C: Update current revision pointer
        C-->>J: Revision created
    else lock conflict blocks safe replan
        C-->>J: LOCK_CONFLICT
    end
```

<a id="PLN-06"></a>

## PLN-06 Query Cycles and Revisions

```mermaid
sequenceDiagram
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    U->>C: Query cycles with cursor
    alt cursor does not match query shape
        C-->>U: QUERY_CURSOR_INVALID
    else valid query
        C->>R: Include revision history and diff summaries
        C-->>U: Paged cycle history
    end
```
