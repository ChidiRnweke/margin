export interface CreateOneOffBlockInput {
  oneOffStartsAtUtc: string;
  oneOffEndsAtUtc: string;
}

export interface CreateRecurringBlockInput {
  localStartMinute: number;
  localEndMinute: number;
  weekdayMask: number;
  startsOnLocal?: string;
  endsOnLocal?: string;
}

export interface AddRecurringExceptionInput {
  exceptionDate: string;
  action: 'Skip' | 'Override';
  overrideStartsAtUtc?: string;
  overrideEndsAtUtc?: string;
  overrideLocalStartMinute?: number;
  overrideLocalEndMinute?: number;
}

export interface UpdateArchiveRestoreBlockInput {
  active?: boolean;
}

export interface DateRange {
  rangeStart: string;
  rangeEnd: string;
}

export interface EffectiveWindow {
  startUtc: string;
  endUtc: string;
  sourceBlockId: string;
}

export interface IAvailabilityService {
  createOneOffBlock(userId: string, input: CreateOneOffBlockInput): Promise<unknown>;
  createRecurringBlock(userId: string, input: CreateRecurringBlockInput): Promise<unknown>;
  addRecurringException(userId: string, blockId: string, input: AddRecurringExceptionInput): Promise<unknown>;
  updateArchiveRestoreBlock(userId: string, blockId: string, input: UpdateArchiveRestoreBlockInput, expectedVersion: number): Promise<unknown>;
  queryEffectiveAvailability(userId: string, range: DateRange): Promise<{ windows: EffectiveWindow[] }>;
}
