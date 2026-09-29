import { config } from 'dotenv'
config()

import bcrypt from 'bcrypt'
import { db } from '../src/db/client.js'
import { users, accounts, transactions, memos, auditLog } from '../src/db/schema.js'
import { seedUsers } from './users.js'
import { seedAccounts } from './accounts.js'
import { buildSeedTransactions } from './transactions.js'
import { buildSeedMemos } from './memos.js'

async function seed() {
    console.log('🌱 Seeding database...')

    // truncate in reverse dependency order
    console.log('  Truncating existing data...')
    await db.delete(auditLog)
    await db.delete(memos)
    await db.delete(transactions)
    await db.delete(accounts)
    await db.delete(users)

    // insert users
    console.log('  Inserting users...')
    const passwordHash = await bcrypt.hash('Password123!', 10)
    const usersWithPasswords = seedUsers.map(u => ({ ...u, passwordHash }))
    const insertedUsers = await db.insert(users).values(usersWithPasswords).returning()

    const supervisors = insertedUsers.filter(u => u.role === 'supervisor')
    const supervisorIds = supervisors.map(u => u.id)

    // insert accounts
    console.log('  Inserting accounts...')
    const insertedAccounts = await db
        .insert(accounts)
        .values(seedAccounts)
        .returning()

    const accountIds = insertedAccounts.map(a => a.id)
    const accountInfo = insertedAccounts.map(a => ({ id: a.id, name: a.customerName }))

    // insert transactions
    console.log('  Inserting transactions...')
    const txns = buildSeedTransactions(accountInfo)
    await db.insert(transactions).values(txns)

    // insert memos
    console.log('  Inserting memos...')
    const memoData = buildSeedMemos(accountIds, supervisorIds)
    const insertedMemos = await db.insert(memos).values(memoData).returning()

    console.log('  Inserting audit log entries for seeded memos...')
    await db.insert(auditLog).values(
        insertedMemos.map(memo => ({
            actorId: memo.authorId,
            entityType: 'account' as const,
            entityId: memo.accountId,
            action: 'memo.created',
            payload: {
                memoId: memo.id,
                body: memo.body,
            },
            createdAt: memo.createdAt,
        }))
    )

    console.log('✅ Seed complete.')
    console.log(`   ${insertedUsers.length} users`)
    console.log(`   ${insertedAccounts.length} accounts`)
    console.log(`   ${txns.length} transactions`)
    console.log(`   ${insertedMemos.length} memos`)
    console.log(`   ${insertedMemos.length} audit log entries`)
}

seed().catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
})