# Data, Audit, and System Sequences

<a id="DAT-01"></a>
## DAT-01 Export JSON

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant E as ExportJob
    participant X as Aspect
    participant M as Milestone
    participant T as Task
    participant A as AuditEvent
    U->>E: Start export
    E->>X: Collect aspects
    E->>M: Collect milestones
    E->>T: Collect tasks and related entities
    E->>A: Collect user-visible audit events
    E-->>U: JSON export artifact ready
```

<a id="DAT-02"></a>
## DAT-02 Import JSON with ID Remap

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant I as ImportJob
    participant X as Aspect
    participant M as Milestone
    participant T as Task
    U->>I: Import JSON payload
    I->>I: Validate schema and ownership scope
    I->>I: Remap conflicting IDs
    I->>X: Persist remapped aspects
    I->>M: Persist remapped milestones
    I->>T: Persist remapped tasks and references
    I-->>U: Import report with remap counts
```

<a id="AUD-01"></a>
## AUD-01 Emit Audit Event on Write

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor W as Write Interaction
    participant D as DomainEntity
    participant A as AuditEvent
    W->>D: Apply mutation
    D->>A: Emit redacted before/after diff
    A->>A: Persist immutable event
```

<a id="AUD-02"></a>
## AUD-02 Query Audit Timeline

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as AuditEvent
    U->>A: List audit events(cursor)
    A->>A: Apply cursor and ownership filter
    A-->>U: Paged immutable timeline
```

<a id="SYS-01"></a>
## SYS-01 Idempotent Command Handling

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant K as IdempotencyKey
    participant C as CommandInteraction
    U->>C: Execute command with idempotency key
    C->>K: Lookup key and request hash
    alt key+hash exists
      K-->>C: Return stored response reference
      C-->>U: Previous response
    else key absent
      C->>C: Execute mutation
      C->>K: Persist key, hash, response ref
      C-->>U: New response
    else key reused with different hash
      C-->>U: VALIDATION_FAILED
    end
```
