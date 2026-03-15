import type { IAuthService } from '$lib/server/services/contracts/auth-service.js';

export class SessionExpiryJob {
constructor(private authService: IAuthService) {}

async execute(): Promise<{ expiredCount: number }> {
return this.authService.expireSessions(new Date());
}
}
