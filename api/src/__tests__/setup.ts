import { beforeAll, afterEach } from 'vitest'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../db/client.js'
import { auditLog, memos, transactions, accounts, users } from '../db/schema.js'

/**
 * Each test file runs against its own fresh in-memory SQLite database
 * (DATABASE_URL=':memory:' from vitest.config.ts). We migrate it once here,
 * then truncate between tests for isolation. The real dev DB is never touched,
 * so an interrupted run can't wipe seeded data.
 */
beforeAll(() => {
    migrate(db, { migrationsFolder: './drizzle' })
})

afterEach(async () => {
    // Truncate in reverse dependency order
    await db.delete(auditLog)
    await db.delete(memos)
    await db.delete(transactions)
    await db.delete(accounts)
    await db.delete(users)
})
