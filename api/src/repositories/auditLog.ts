import { db } from '../db/client.js'
import { auditLog, users } from '../db/schema.js'
import { eq, desc, count } from 'drizzle-orm'
import type { AuditEntry } from '@shared/types'

export async function findAuditEntriesByAccount(opts: {
  accountId: string
  page: number
  pageSize: number
}): Promise<{ rows: AuditEntry[], total: number }> {
  const { accountId, page, pageSize } = opts
  const offset = (page - 1) * pageSize

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        actorId: auditLog.actorId,
        actorName: users.name,
        actorRole: users.role,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        action: auditLog.action,
        payload: auditLog.payload,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorId, users.id))
      .where(eq(auditLog.entityId, accountId))
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(auditLog)
      .where(eq(auditLog.entityId, accountId)),
  ])

  return {
    rows: rows.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })) as AuditEntry[],
    total: Number(totalResult[0]?.count ?? 0),
  }
}
