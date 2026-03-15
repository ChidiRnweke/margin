// AppFactory stub — composition root wired in Steps 71-72

export class AppFactory {
  // Repository getters will be added as repositories are implemented
  // Service getters will be added as services are implemented
  // Controller getters will be added as controllers are implemented

  static create(_config: Record<string, unknown>): AppFactory {
    return new AppFactory();
  }
}
