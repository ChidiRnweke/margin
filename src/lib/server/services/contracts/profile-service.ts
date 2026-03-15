export interface OnboardingStatus {
  complete: boolean;
  activeAspectCount: number;
}

export interface UpdatePlanningProfileInput {
  urgencyWeight?: number;
  importanceWeight?: number;
  balanceWeight?: number;
  effortFitWeight?: number;
  urgentThresholdDays?: number;
  minChunkMinutes?: number;
  defaultEffortMinutes?: number;
}

export interface IProfileService {
  completeOnboarding(userId: string): Promise<OnboardingStatus>;
  updatePlanningProfile(
    userId: string,
    input: UpdatePlanningProfileInput,
    expectedVersion: number
  ): Promise<unknown>; // Returns PlanningProfile once defined
}
