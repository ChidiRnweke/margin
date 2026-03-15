import { InputError } from '$lib/server/errors/domain-errors.js';

export class PlannerWeight {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new InputError('Planner weight must be an integer between 0 and 100', { value });
    }
    this.value = value;
  }
}

export class UrgentThresholdDays {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 30) {
      throw new InputError('Urgent threshold days must be an integer between 0 and 30', { value });
    }
    this.value = value;
  }
}

export class MinChunkMinutes {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 5 || value > 120) {
      throw new InputError('Min chunk minutes must be an integer between 5 and 120', { value });
    }
    this.value = value;
  }
}

export class PositiveMinutes {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InputError('Minutes must be a positive integer', { value });
    }
    this.value = value;
  }
}

export class NonNegativeMinutes {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new InputError('Minutes must be a non-negative integer', { value });
    }
    this.value = value;
  }
}

export class ImportanceScore {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new InputError('Importance score must be an integer between 0 and 100', { value });
    }
    this.value = value;
  }
}

export class TargetPercentage {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new InputError('Target percentage must be an integer between 1 and 100', { value });
    }
    this.value = value;
  }
}

export class PositiveInterval {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InputError('Interval must be a positive integer', { value });
    }
    this.value = value;
  }
}

export class RevisionNumber {
  readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new InputError('Revision number must be a positive integer', { value });
    }
    this.value = value;
  }
}
