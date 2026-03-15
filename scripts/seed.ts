/**
 * Deterministic seed data for Margin development.
 * Run with: npx tsx scripts/seed.ts
 */

const SEED_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@margin.app',
  displayName: 'Dev User',
  timezoneNameIana: 'America/New_York',
  utcOffsetMinutesSnapshot: -300,
  dstOffsetMinutesSnapshot: 60,
  identityVerified: true,
};

const SEED_ASPECTS = [
  { id: '00000000-0000-0000-0000-000000000010', name: 'Career', purpose: 'Professional growth and skill development', targetPercentage: 35, status: 'Active' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Health', purpose: 'Physical and mental wellbeing', targetPercentage: 25, status: 'Active' },
  { id: '00000000-0000-0000-0000-000000000012', name: 'Relationships', purpose: 'Family and friends', targetPercentage: 25, status: 'Active' },
  { id: '00000000-0000-0000-0000-000000000013', name: 'Personal Growth', purpose: 'Learning and hobbies', targetPercentage: 15, status: 'Active' },
];

const SEED_TASKS = [
  { id: '00000000-0000-0000-0000-000000000020', aspectId: SEED_ASPECTS[0].id, title: 'Prepare quarterly review', effortMinutes: 120, importanceScore: 80, status: 'InProgress' },
  { id: '00000000-0000-0000-0000-000000000021', aspectId: SEED_ASPECTS[0].id, title: 'Study system design patterns', effortMinutes: 90, importanceScore: 60, status: 'Backlog' },
  { id: '00000000-0000-0000-0000-000000000022', aspectId: SEED_ASPECTS[1].id, title: 'Morning run - 5K', effortMinutes: 45, importanceScore: 70, status: 'Backlog', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10) },
  { id: '00000000-0000-0000-0000-000000000023', aspectId: SEED_ASPECTS[1].id, title: 'Meal prep for the week', effortMinutes: 60, importanceScore: 50, status: 'Backlog' },
  { id: '00000000-0000-0000-0000-000000000024', aspectId: SEED_ASPECTS[2].id, title: 'Call parents', effortMinutes: 30, importanceScore: 90, status: 'Backlog' },
  { id: '00000000-0000-0000-0000-000000000025', aspectId: SEED_ASPECTS[3].id, title: 'Read chapter of design book', effortMinutes: 45, importanceScore: 40, status: 'Backlog' },
];

console.log('Seed data definitions ready.');
console.log(`User: ${SEED_USER.email}`);
console.log(`Aspects: ${SEED_ASPECTS.length}`);
console.log(`Tasks: ${SEED_TASKS.length}`);
console.log('Note: To apply seeds, a running Postgres instance with migrations is required.');

export { SEED_USER, SEED_ASPECTS, SEED_TASKS };
