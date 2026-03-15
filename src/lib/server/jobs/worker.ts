export interface JobRegistration {
name: string;
schedule?: string;
handler: (...args: unknown[]) => Promise<unknown>;
}

export class WorkerBootstrap {
private jobs: JobRegistration[] = [];

register(job: JobRegistration) {
this.jobs.push(job);
}

getRegistrations() {
return this.jobs;
}
}
