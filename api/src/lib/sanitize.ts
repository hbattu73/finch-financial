import type { DbUser } from '../types/auth.js'
import type { User } from '@shared/types'

export function sanitizeUser(user: DbUser): User {
    const { passwordHash: _, ...safe } = user
    return { ...safe, createdAt: safe.createdAt.toISOString() } as User
}
