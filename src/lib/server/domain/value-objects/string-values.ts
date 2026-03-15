import { InputError } from '$lib/server/errors/domain-errors.js';

export class AspectName {
  readonly value: string;
  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Aspect name is required');
    if (trimmed.length > 200) throw new InputError('Aspect name must be 200 characters or fewer');
    this.value = trimmed;
  }
  toString(): string { return this.value; }
}

export class AspectPurpose {
  readonly value: string;
  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Aspect purpose is required');
    if (trimmed.length > 2000) throw new InputError('Aspect purpose must be 2000 characters or fewer');
    this.value = trimmed;
  }
  toString(): string { return this.value; }
}

export class MilestoneTitle {
  readonly value: string;
  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Milestone title is required');
    if (trimmed.length > 200) throw new InputError('Milestone title must be 200 characters or fewer');
    this.value = trimmed;
  }
  toString(): string { return this.value; }
}

export class TaskTitle {
  readonly value: string;
  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Task title is required');
    if (trimmed.length > 200) throw new InputError('Task title must be 200 characters or fewer');
    this.value = trimmed;
  }
  toString(): string { return this.value; }
}

export class TaskTitleTemplate {
  readonly value: string;
  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new InputError('Task title template is required');
    if (trimmed.length > 200) throw new InputError('Task title template must be 200 characters or fewer');
    this.value = trimmed;
  }
  toString(): string { return this.value; }
}
