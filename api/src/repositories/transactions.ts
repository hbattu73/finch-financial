import { db } from '../db/client.js'
import { transactions, accounts } from '../db/schema.js'
import { eq, count, and, inArray, like, desc } from 'drizzle-orm'
import type { AccountStatus, TransactionDirection, TransactionStatus } from '@shared/types'

export async function findTransactionsByAccount(opts: {
    accountId: string
    page: number
    pageSize: number
}) {
    const { accountId, page, pageSize } = opts
    const offset = (page - 1) * pageSize

    const [rows, totalResult] = await Promise.all([
        db
            .select()
            .from(transactions)
            .where(eq(transactions.accountId, accountId))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(transactions)
            .where(eq(transactions.accountId, accountId)),
    ])

    return {
        rows,
        total: Number(totalResult[0]?.count ?? 0),
    }
}

/**
 * Find all transactions across accounts with filtering and RBAC.
 * Default sort: posted_at DESC (newest first).
 */
export async function findAllTransactions(opts: {
    q?: string
    direction?: TransactionDirection
    status?: TransactionStatus
    allowedAccountStatuses: AccountStatus[]
    page: number
    pageSize: number
}) {
    const { q, direction, status, allowedAccountStatuses, page, pageSize } = opts
    const offset = (page - 1) * pageSize

    // Build WHERE conditions
    const conditions = [
        inArray(accounts.status, allowedAccountStatuses),
    ]

    if (q) {
        conditions.push(like(accounts.customerName, `%${q}%`))
    }

    if (direction) {
        conditions.push(eq(transactions.direction, direction))
    }

    if (status) {
        conditions.push(eq(transactions.status, status))
    }

    const whereClause = and(...conditions)

    // Fetch rows with join
    const rows = await db
        .select({
            id: transactions.id,
            accountId: transactions.accountId,
            amount: transactions.amount,
            direction: transactions.direction,
            description: transactions.description,
            postedAt: transactions.postedAt,
            status: transactions.status,
            createdAt: transactions.createdAt,
            customerName: accounts.customerName,
            accountNumber: accounts.accountNumber,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(whereClause)
        .orderBy(desc(transactions.postedAt))
        .limit(pageSize)
        .offset(offset)

    // Fetch total count
    const totalResult = await db
        .select({ count: count() })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(whereClause)

    return {
        rows,
        total: Number(totalResult[0]?.count ?? 0),
    }
}