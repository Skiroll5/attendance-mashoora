import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from 'next-auth/adapters';
import { sql } from 'drizzle-orm';

// --- Auth.js Tables (Enterprise Auth) ---

export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
});

export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] })
]);

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] })
]);

// --- Application Tables ---

export const students = sqliteTable('students', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number'),
  birthday: text('birthday'),
  graduation: text('graduation'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const classSessions = sqliteTable('class_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  className: text('class_name').notNull(),
  sessionDate: integer('session_date', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  scannedAt: integer('scanned_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (t) => [
  uniqueIndex('session_student_idx').on(t.sessionId, t.studentId)
]);
