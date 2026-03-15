import type { User } from '$lib/server/domain/models/user.js';

export interface IUserRepository {
	findById(userId: string): Promise<User | null>;
	findByIdentityClaim(claims: { email: string }): Promise<User | null>;
	create(user: User): Promise<User>;
	delete(userId: string): Promise<void>;
}
