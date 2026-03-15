# Domain Layer

Pure domain models, value objects, and enums.

## Rules
- No imports from repositories, services, controllers, or infrastructure
- Value objects enforce construction-time invariants
- Models enforce structural constraints
- All types are immutable after construction
