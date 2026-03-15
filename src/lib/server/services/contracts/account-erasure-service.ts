export interface IAccountErasureService {
	eraseUserAccount(userId: string): Promise<void>;
}
