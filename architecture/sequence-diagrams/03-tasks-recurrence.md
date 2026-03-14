# Task and Recurrence Sequences

<a id="TSK-01"></a>
## TSK-01 Create Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    participant M as Milestone
    participant T as Task
    U->>T: Create task(title, aspect, optional milestone)
    T->>A: Validate aspect is active and owned
    alt milestone provided
      T->>M: Validate milestone belongs to same aspect
    end
    T->>T: Apply defaults and set Backlog
    T-->>U: Task created
```

<a id="TSK-02"></a>
## TSK-02 Update Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    U->>T: Update due date, effort, remaining, importance, split override
    T->>T: Validate ranges and ownership
    T->>T: Persist update
    T-->>U: Task updated
```

<a id="TSK-03"></a>
## TSK-03 Move Task Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant M as Milestone
    U->>T: Move task to milestone
    T->>M: Validate target milestone in same aspect
    alt same aspect
      T->>T: Update milestone reference
      T-->>U: Task moved
    else different aspect
      T-->>U: VALIDATION_FAILED
    end
```

<a id="TSK-04"></a>
## TSK-04 Start Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    U->>T: Set status InProgress
    T->>T: Validate Backlog to InProgress transition
    T->>T: Persist transition
    T-->>U: Task started
```

<a id="TSK-05"></a>
## TSK-05 Complete Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant R as Reminder
    participant C as RecurrenceRule
    U->>T: Mark task Done
    T->>T: Set status Done (force completion allowed)
    T->>R: Cancel pending reminders
    alt recurrence exists and active
      T->>C: Trigger next instance generation
    end
    T-->>U: Task completed
```

<a id="TSK-06"></a>
## TSK-06 Reopen Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant A as TaskAllocation
    U->>T: Reopen task
    T->>T: Set Done to Backlog
    T->>A: Cancel future active allocations
    T-->>U: Task reopened
```

<a id="TSK-07"></a>
## TSK-07 Archive Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant R as Reminder
    participant A as TaskAllocation
    U->>T: Archive task
    T->>T: Set status Archived
    T->>R: Cancel pending reminders
    T->>A: Cancel future allocations
    T-->>U: Task archived
```

<a id="TSK-08"></a>
## TSK-08 Restore Task

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    U->>T: Restore task
    T->>T: Restore prior non-archived state
    T-->>U: Task restored
```

<a id="TSK-09"></a>
## TSK-09 Bulk Task Mutation

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant M as Milestone
    U->>T: Bulk mutate tasks(operation, ids)
    loop each task id
      alt operation is move milestone
        T->>M: Validate same-aspect target
      end
      T->>T: Apply operation per task
    end
    T-->>U: Per-task success/error report
```

<a id="TSK-10"></a>
## TSK-10 Query and Search Tasks

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    U->>T: List/search tasks(filters, query, cursor)
    T->>T: Exclude done and archived by default
    T->>T: Sort urgency then due then created
    T-->>U: Paged task results
```

<a id="TSK-11"></a>
## TSK-11 Read Task Detail

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant R as Reminder
    participant C as RecurrenceRule
    participant A as TaskAllocation
    U->>T: Get task detail
    T->>R: Load reminders
    T->>C: Load recurrence rule
    T->>A: Load allocations
    T-->>U: Task detail payload
```

<a id="REC-01"></a>
## REC-01 Attach or Update Rule

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant T as Task
    participant C as RecurrenceRule
    U->>C: Upsert recurrence rule for task
    C->>T: Validate task ownership and state
    C->>C: Validate frequency and interval
    C->>C: Persist active rule
    C-->>U: Rule saved
```

<a id="REC-02"></a>
## REC-02 Pause or Resume Rule

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as RecurrenceRule
    U->>C: Pause or resume recurrence
    C->>C: Toggle paused flag
    C-->>U: Rule state updated
```

<a id="REC-03"></a>
## REC-03 Skip Occurrence

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant C as RecurrenceRule
    U->>C: Skip next occurrence
    C->>C: Record skip exception
    C-->>U: Occurrence skipped
```

<a id="REC-04"></a>
## REC-04 Generate Next Instance

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Recurrence Job
    participant C as RecurrenceRule
    participant T as Task
    J->>C: Find completed recurring tasks
    C->>T: Create next task instance
    C->>T: Enforce single carried overdue instance
    C-->>J: Generation result
```
