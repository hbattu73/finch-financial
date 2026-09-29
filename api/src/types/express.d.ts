import type { Role } from '@shared/types'

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string
                role: Role
            }
        }
    }
}