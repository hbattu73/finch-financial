import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '@shared/types'
import { Errors } from '../lib/errors.js'
import { getJwtSecret } from '../lib/config.js'

export async function currentUser(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const cookieHeader = req.headers.cookie ?? ''
        const sessionCookie = cookieHeader
            .split(';')
            .map(c => c.trim())
            .find(c => c.startsWith('ops_session='))
        const token = sessionCookie?.substring('ops_session='.length)

        if (!token) {
            next(Errors.unauthorized())
            return
        }

        const secret = getJwtSecret()

        const payload = jwt.verify(token, secret) as {
            userId: string
            role: Role
        }

        req.user = {
            userId: payload.userId,
            role: payload.role,
        }

        next()
    } catch (err) {
        if (
            err instanceof jwt.JsonWebTokenError ||
            err instanceof jwt.TokenExpiredError
        ) {
            next(Errors.unauthorized())
            return
        }
        next(err)
    }
}
