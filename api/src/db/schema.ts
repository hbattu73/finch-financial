import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),  // 'analyst' | 'supervisor'
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  customerName: text('customer_name').notNull(),
  accountNumber: text('account_number').notNull(),
  type: text('type').notNull(),          // 'checking' | 'savings'
  balance: text('balance').notNull(),    // money kept as string — never float
  status: text('status').notNull(),      // 'active' | 'frozen' | 'closed'
  openedAt: integer('opened_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  accountId: text('account_id').notNull().references(() => accounts.id),
  amount: text('amount').notNull(),        // money kept as string — never float
  direction: text('direction').notNull(),  // 'credit' | 'debit'
  description: text('description').notNull(),
  postedAt: integer('posted_at', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(),        // 'posted' | 'pending'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const memos = sqliteTable('memos', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  accountId: text('account_id').notNull().references(() => accounts.id),
  authorId: text('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  actorId: text('actor_id').notNull().references(() => users.id),
  entityType: text('entity_type').notNull(), // 'account' | 'transaction' | 'memo'
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),          // 'memo.created' | 'account.frozen' etc.
  payload: text('payload', { mode: 'json' }).$type<Record<string, unknown>>().notNull().$defaultFn(() => ({})),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
