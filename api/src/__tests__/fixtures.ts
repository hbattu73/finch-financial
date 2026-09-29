import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/client.js'
import { users, accounts, transactions, memos } from '../db/schema.js'
import type { Role, AccountType, AccountStatus, TransactionDirection, TransactionStatus } from '@shared/types'

export function createSessionCookie(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET environment variable is not configured')
    const token = jwt.sign({ userId, role }, secret, { expiresIn: '8h' })
    return `ops_session=${token}`
}

/**
 * Create a test user with optional overrides
 */
export async function createTestUser(overrides: {
    name?: string
    email?: string
    role?: Role
    password?: string
} = {}) {
    const timestamp = Date.now()
    const passwordHash = await bcrypt.hash(
        overrides.password ?? 'Password123!',
        10
    )

    const [user] = await db
        .insert(users)
        .values({
            name: overrides.name ?? `Test User ${timestamp}`,
            email: overrides.email ?? `test-${timestamp}@example.com`,
            role: overrides.role ?? 'analyst',
            passwordHash,
        })
        .returning()

    return user!
}

/**
 * Create a test account with optional overrides
 */
export async function createTestAccount(overrides: {
    customerName?: string
    accountNumber?: string
    type?: AccountType
    balance?: string
    status?: AccountStatus
    openedAt?: Date
} = {}) {
    const timestamp = Date.now()

    const [account] = await db
        .insert(accounts)
        .values({
            customerName: overrides.customerName ?? `Test Customer ${timestamp}`,
            accountNumber: overrides.accountNumber ?? `****-****-****-${timestamp.toString().slice(-4)}`,
            type: overrides.type ?? 'checking',
            balance: overrides.balance ?? '1000.00',
            status: overrides.status ?? 'active',
            openedAt: overrides.openedAt ?? new Date(),
        })
        .returning()

    return account!
}

/**
 * Create a test transaction with optional overrides
 */
export async function createTestTransaction(
    accountId: string,
    overrides: {
        amount?: string
        direction?: TransactionDirection
        description?: string
        postedAt?: Date
        status?: TransactionStatus
    } = {}
) {
    const [transaction] = await db
        .insert(transactions)
        .values({
            accountId,
            amount: overrides.amount ?? '100.00',
            direction: overrides.direction ?? 'credit',
            description: overrides.description ?? 'Test transaction',
            postedAt: overrides.postedAt ?? new Date(),
            status: overrides.status ?? 'posted',
        })
        .returning()

    return transaction!
}

/**
 * Create a test memo with optional overrides
 */
export async function createTestMemo(
    accountId: string,
    authorId: string,
    overrides: {
        body?: string
    } = {}
) {
    const [memo] = await db
        .insert(memos)
        .values({
            accountId,
            authorId,
            body: overrides.body ?? 'Test memo',
        })
        .returning()

    return memo!
}
