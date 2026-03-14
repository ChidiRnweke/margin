# Auth and Profile Sequences

<a id="AUTH-01"></a>

## AUTH-01 Identity Sign-In Start

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant O as IdentityProvider
    U->>O: Start identity sign-in
    O-->>U: Redirect to identity consent
```

<a id="AUTH-02"></a>

## AUTH-02 Identity Callback

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    participant O as IdentityProvider
    participant A as Account
    participant S as Session
    O->>A: Provide verified identity claims
    A->>A: Create or link user account
    A->>S: Create server session
    S-->>O: Callback accepted
```

<a id="AUTH-03"></a>

## AUTH-03 Logout

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant S as Session
    U->>S: Logout current session
    S->>S: Revoke session token
    S-->>U: Session closed
```

<a id="AUTH-04"></a>

## AUTH-04 Session Expiry

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor J as Session Expiry Job
    participant S as Session
    J->>S: Sweep sessions past max lifetime
    S->>S: Mark expired sessions revoked
    S-->>J: Expiry result
```

<a id="AUTH-05"></a>

## AUTH-05 First-Run Wizard Completion

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant A as Aspect
    U->>A: Complete onboarding setup
    A->>A: Count active aspects for user
    alt at least one active aspect
      A-->>U: Onboarding complete
    else none active
      A-->>U: TARGET_PERCENT_TOTAL_INVALID
    end
```

<a id="PRF-01"></a>

## PRF-01 Update Planning Profile

```mermaid
sequenceDiagram
    participant G as AuthorizationPolicy
    Note over G: Access and permission check for acting principal
    actor U as User
    participant P as PlanningProfile
    U->>P: Update weights, threshold, min chunk, default effort
    P->>P: Validate allowed ranges
    P->>P: Persist profile changes
    P-->>U: Profile updated
```
