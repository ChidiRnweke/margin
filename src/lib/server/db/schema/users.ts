import { pgTable, uuid, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	displayName: varchar('display_name', { length: 255 }).notNull(),
	timezoneNameIana: varchar('timezone_name_iana', { length: 100 }).notNull(),
	utcOffsetMinutesSnapshot: integer('utc_offset_minutes_snapshot'),
	dstOffsetMinutesSnapshot: integer('dst_offset_minutes_snapshot'),
	identityVerified: boolean('identity_verified').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});
