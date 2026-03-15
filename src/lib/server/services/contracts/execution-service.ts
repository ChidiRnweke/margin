export interface MarkOutcomeInput {
  outcome: 'Attended' | 'Missed';
}

export interface IExecutionService {
  markAllocationOutcome(
    userId: string,
    allocationId: string,
    input: MarkOutcomeInput,
    expectedVersion: number
  ): Promise<unknown>;
}
