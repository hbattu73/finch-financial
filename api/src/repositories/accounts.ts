import { db } from '../db/client.js'
import { accounts } from '../db/schema.js'
import { eq, like, inArray, count, and } from 'drizzle-orm'
import type { AccountStatus } from '@shared/types'

export async function findAccounts(opts: {
    status?: AccountStatus | AccountStatus[]
    q?: string
    page: number
    pageSize: number
}) {
    const { status, q, page, pageSize } = opts
    const offset = (page - 1) * pageSize

    const conditions = []

    if (status) {
        if (Array.isArray(status)) {
            conditions.push(inArray(accounts.status, status))
        } else {
            conditions.push(eq(accounts.status, status))
        }
    }

    if (q) {
        conditions.push(like(accounts.customerName, `%${q}%`))
    }

    const where = conditions.length > 0
        ? conditions.length === 1
            ? conditions[0]
            : and(...conditions)
        : undefined

    const [rows, totalResult] = await Promise.all([
        db
            .select()
            .from(accounts)
            .where(where)
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(accounts)
            .where(where),
    ])

    return {
        rows,
        total: Number(totalResult[0]?.count ?? 0),
    }
}

export async function findAccountById(id: string) {
    const result = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1)
    return result[0] ?? null
}