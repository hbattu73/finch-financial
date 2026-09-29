import type { InferSelectModel } from 'drizzle-orm'
import type { users } from '../db/schema.js'
import type { Role } from '@shared/types'

export type DbUser = InferSelectModel<typeof users>

export type AuthUser = {
    userId: string
    role: Role
}
