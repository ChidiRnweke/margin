# Aspect and Milestone Sequences

<a id="ASP-01"></a>
## ASP-01 Create Draft Aspect

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    U->>A: Create aspect(name, purpose)
    A->>A: Set status Draft
    A-->>U: Aspect created
```

<a id="ASP-02"></a>
## ASP-02 Activate Aspect

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    U->>A: Activate aspect(target %)
    A->>A: Recalculate active target total
    alt total equals 100
      A->>A: Set status Active
      A-->>U: Aspect activated
    else total not 100
      A-->>U: TARGET_PERCENT_TOTAL_INVALID
    end
```

<a id="ASP-03"></a>
## ASP-03 Update Aspect

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    U->>A: Update metadata or target percentage
    A->>A: Validate active-target constraints
    A->>A: Persist update
    A-->>U: Aspect updated
```

<a id="ASP-04"></a>
## ASP-04 Archive Aspect

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    participant M as Milestone
    participant T as Task
    U->>A: Archive aspect
    A->>A: Set status Archived
    A->>M: Archive child milestones
    M->>T: Archive child tasks
    A-->>U: Aspect archived with cascade
```

<a id="ASP-05"></a>
## ASP-05 Restore Aspect

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    participant M as Milestone
    participant T as Task
    U->>A: Restore aspect
    A->>A: Restore prior state
    A->>M: Restore milestones to prior states
    M->>T: Restore tasks to prior states
    A-->>U: Aspect restored
```

<a id="ASP-06"></a>
## ASP-06 Query Aspects

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    U->>A: List aspects(status/date filters, cursor)
    A->>A: Apply query and cursor binding
    A-->>U: Paged aspects
```

<a id="MLS-01"></a>
## MLS-01 Create Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    participant M as Milestone
    U->>M: Create milestone in aspect
    M->>A: Validate aspect is active and owned
    M->>M: Set status Open
    M-->>U: Milestone created
```

<a id="MLS-02"></a>
## MLS-02 Update Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    U->>M: Update title/description/target date
    M->>M: Persist changes
    M-->>U: Milestone updated
```

<a id="MLS-03"></a>
## MLS-03 Complete Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    participant T as Task
    U->>M: Mark milestone Done
    M->>T: Check all child tasks are Done
    alt all tasks done
      M->>M: Set status Done
      M-->>U: Milestone completed
    else any task open
      M-->>U: STATE_TRANSITION_INVALID
    end
```

<a id="MLS-04"></a>
## MLS-04 Reopen Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    U->>M: Reopen milestone
    M->>M: Set status Done to Open
    M-->>U: Milestone reopened
```

<a id="MLS-05"></a>
## MLS-05 Archive Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    participant T as Task
    U->>M: Archive milestone
    M->>M: Set status Archived
    M->>T: Archive child tasks
    M-->>U: Milestone archived
```

<a id="MLS-06"></a>
## MLS-06 Restore Milestone

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    U->>M: Restore milestone
    M->>M: Restore prior state
    M-->>U: Milestone restored
```

<a id="MLS-07"></a>
## MLS-07 Query Milestones

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant M as Milestone
    U->>M: List milestones(aspect/status/date, cursor)
    M->>M: Apply query and cursor binding
    M-->>U: Paged milestones
```
