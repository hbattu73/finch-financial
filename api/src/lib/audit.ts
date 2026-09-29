import { db } from '../db/client.js'
import { auditLog } from '../db/schema.js'
import type { AuditEntityType } from '@shared/types'

export async function writeAuditLog(opts: {
  actorId: string
  entityType: AuditEntityType
  entityId: string
  action: string
  payload?: Record<string, unknown>
}): Promise<void> {
  await db.insert(auditLog).values({
    actorId: opts.actorId,
    entityType: opts.entityType,
    entityId: opts.entityId,
    action: opts.action,
    payload: opts.payload ?? {},
  })
}
