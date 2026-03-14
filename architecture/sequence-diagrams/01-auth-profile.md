# Auth and Profile Sequences

All sequences assume principal validation before the first domain read or mutation except `AUTH-01` and `AUTH-02`, which occur before a user session exists.

<a id="AUTH-01"></a>

## AUTH-01 Identity Sign-In Start

```mermaid
sequenceDiagram
    actor U as User
    participant O as IdentityProvider
    U->>O: Start identity sign-in
    alt provider accepts request
        O-->>U: Redirect to identity consent
    else invalid provider request
        O-->>U: VALIDATION_FAILED
    end
```

<a id="AUTH-02"></a>

## AUTH-02 Identity Callback

```mermaid
sequenceDiagram
    participant O as IdentityProvider
    participant U as User
    participant P as PlanningProfile
    participant S as Session
    O->>U: Provide verified identity claims
    alt claims invalid or unverifiable
        U-->>O: VALIDATION_FAILED
    else existing user matched
        U->>S: Create new session
        S-->>O: Callback accepted
    else no existing user
        U->>U: Create verified user account
        U->>P: Bootstrap default planning profile
        U->>S: Create first session
        S-->>O: Callback accepted
    end
```

<a id="AUTH-03"></a>

## AUTH-03 Logout

```mermaid
sequenceDiagram
    actor U as User
    participant S as Session
    U->>S: Logout current session
    alt session exists and is active
        S->>S: Revoke session token
        S-->>U: Session closed
    else session missing
        S-->>U: NOT_FOUND
    end
```

<a id="AUTH-04"></a>

## AUTH-04 Session Expiry

```mermaid
sequenceDiagram
    actor J as SessionExpiryJob
    participant S as Session
    J->>S: Sweep sessions past max lifetime
    S->>S: Mark expired sessions as Expired
    S-->>J: Expiry result
```

<a id="AUTH-05"></a>

## AUTH-05 First-Run Wizard Completion

```mermaid
sequenceDiagram
    actor U as User
    participant A as Aspect
    U->>A: Complete onboarding setup
    A->>A: Count active aspects for user
    alt at least one active aspect
        A-->>U: Onboarding complete
    else none active
        A-->>U: VALIDATION_FAILED
    end
```

<a id="AUTH-06"></a>

## AUTH-06 GDPR Account Deletion

```mermaid
sequenceDiagram
    actor U as User
    participant S as Session
    participant P as PlanningProfile
    participant A as Aspect
    participant V as AvailabilityBlock
    participant C as PlanningCycle
    participant L as TaskLock
    participant R as Reminder
    participant E as AuditEvent
    participant K as IdempotencyKey
    participant I as ImportJob
    participant X as ExportJob
    U->>U: Request permanent account deletion
    U->>S: Verify active session and revoke all sessions
    alt session invalid or expired
        S-->>U: AUTH_SESSION_EXPIRED
    else deletion allowed
        U->>R: Delete reminders and delivery attempts
        U->>C: Delete cycles, revisions, allocations, outcomes, and health
        U->>L: Delete task locks
        U->>V: Delete availability and exceptions
        U->>A: Delete aspects, milestones, tasks, and recurring series
        U->>P: Delete planning profile
        U->>I: Delete import jobs
        U->>X: Delete export jobs
        U->>K: Delete idempotency records
        U->>E: Delete audit timeline
        U->>U: Delete user account
        U-->>U: Account fully erased
    end
```

<a id="PRF-01"></a>

## PRF-01 Update Planning Profile

```mermaid
sequenceDiagram
    actor U as User
    participant P as PlanningProfile
    U->>P: Update weights, threshold, min chunk, default effort
    alt values outside allowed ranges
        P-->>U: VALIDATION_FAILED
    else stale version
        P-->>U: CONFLICT_STALE_WRITE
    else valid update
        P->>P: Persist profile changes
        P-->>U: Profile updated
    end
```
