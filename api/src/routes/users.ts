import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { sanitizeUser } from '../lib/sanitize.js'

export const usersRouter = Router()

// GET /api/users — all users (for user switcher)
// Note: No auth required - this endpoint is used for initial user selection
usersRouter.get(
    '/',
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const allUsers = await db.select().from(users)
            res.json({ data: allUsers.map(sanitizeUser) })
        } catch (err) {
            next(err)
        }
    }
)