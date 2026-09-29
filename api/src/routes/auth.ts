import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { Errors } from '../lib/errors.js'
import { sanitizeUser } from '../lib/sanitize.js'
import { getJwtSecret } from '../lib/config.js'

export const authRouter = Router()

// POST /api/auth/login
authRouter.post(
    '/login',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body as {
                email?: string
                password?: string
            }

            if (!email || !password) {
                next(Errors.badRequest('Email and password are required'))
                return
            }

            const result = await db
                .select()
                .from(users)
                .where(eq(users.email, email.toLowerCase().trim()))
                .limit(1)

            const user = result[0]

            // Run bcrypt even if user not found to prevent timing attacks
            const hash = user?.passwordHash ?? '$2b$10$invalidhashfortimingnoop000000000000000000000'
            const valid = await bcrypt.compare(password, hash)

            if (!user || !valid) {
                next(Errors.badRequest('Invalid email or password'))
                return
            }

            const secret = getJwtSecret()

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                secret,
                { expiresIn: '8h' }
            )

            res.setHeader(
                'Set-Cookie',
                `ops_session=${token}; HttpOnly; Path=/; SameSite=Lax`
            )

            res.json({ data: sanitizeUser(user) })
        } catch (err) {
            next(err)
        }
    }
)

// DELETE /api/auth/logout
authRouter.delete('/logout', (_req: Request, res: Response) => {
    res.setHeader(
        'Set-Cookie',
        'ops_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'
    )
    res.status(204).send()
})