# Availability and Planning Sequences

<a id="AVL-01"></a>
## AVL-01 Create One-Off Availability Block

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Create one-off block(start, end)
    B->>B: Validate start < end
    B->>B: Merge overlapping windows
    B-->>U: Block created
```

<a id="AVL-02"></a>
## AVL-02 Create Recurring Availability Block

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Create recurring block(rule, start, end)
    B->>B: Validate recurrence and duration
    B->>B: Persist recurring template
    B-->>U: Recurring block created
```

<a id="AVL-03"></a>
## AVL-03 Add Recurring Exception

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant B as AvailabilityBlock
    participant E as AvailabilityException
    U->>E: Add skip/override for date
    E->>B: Validate block ownership and existence
    E->>E: Persist exception
    E-->>U: Exception saved
```

<a id="AVL-04"></a>
## AVL-04 Update, Archive, Restore Availability

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant B as AvailabilityBlock
    U->>B: Update or archive or restore block
    B->>B: Apply lifecycle change
    B->>B: Recompute merged windows
    B-->>U: Availability updated
```

<a id="AVL-05"></a>
## AVL-05 Query Effective Availability

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant B as AvailabilityBlock
    participant E as AvailabilityException
    U->>B: Query effective availability(range)
    B->>E: Apply exceptions to recurring blocks
    B->>B: Return merged non-overlapping windows
    B-->>U: Effective availability
```

<a id="PLN-01"></a>
## PLN-01 Generate Draft Weekly Plan

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant T as Task
    participant B as AvailabilityBlock
    participant P as PlanningProfile
    participant L as TaskLock
    participant A as TaskAllocation
    U->>C: Generate plan for ISO week
    C->>T: Load feasible open tasks
    C->>B: Load effective availability
    C->>P: Load scoring profile
    C->>L: Load active locks
    C->>C: Rank tasks and apply hard constraints
    C->>R: Create revision 1
    R->>A: Create proposed allocations
    C-->>U: Draft cycle and allocations
```

<a id="PLN-02"></a>
## PLN-02 Confirm Draft Plan

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as PlanningCycle
    participant A as TaskAllocation
    U->>C: Confirm draft cycle
    C->>C: Set cycle status Confirmed
    C->>A: Mark proposed allocations Confirmed
    C-->>U: Plan confirmed
```

<a id="PLN-03"></a>
## PLN-03 Regenerate Confirmed Plan

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant A as TaskAllocation
    U->>C: Regenerate confirmed cycle
    C->>R: Mark current revision superseded
    C->>R: Create next revision
    R->>A: Generate replacement allocations
    C-->>U: New active revision
```

<a id="PLN-04"></a>
## PLN-04 Edit Allocation, Lock, Unlock, Cancel

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant R as PlanningRevision
    participant A as TaskAllocation
    participant L as TaskLock
    U->>R: Edit allocation or lock/unlock/cancel
    alt lock update
      R->>L: Create or release exact-time lock
    end
    R->>A: Apply allocation mutation
    R-->>U: Revised plan snapshot
```

<a id="PLN-05"></a>
## PLN-05 Day-Boundary Replan Job

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Replan Job
    participant C as PlanningCycle
    participant R as PlanningRevision
    participant T as Task
    J->>C: Replan active cycles at day boundary
    C->>T: Refresh overdue and feasibility state
    alt changes needed
      C->>R: Create superseding revision
      C-->>J: Revision created
    else no change
      C-->>J: No-op
    end
```

<a id="PLN-06"></a>
## PLN-06 Query Cycles and Revisions

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as PlanningCycle
    participant R as PlanningRevision
    U->>C: Query cycles with cursor
    C->>R: Include revision history and diffs
    C-->>U: Paged cycle history
```
