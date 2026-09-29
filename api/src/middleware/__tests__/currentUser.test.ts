import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { currentUser } from '../currentUser.js'
import { Errors } from '../../lib/errors.js'

describe('currentUser middleware', () => {
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        mockReq = {
            headers: {},
        }
        mockRes = {}
        mockNext = vi.fn()
        process.env.JWT_SECRET = 'test-secret'
    })

    it('should extract user from valid JWT', async () => {
        const token = jwt.sign(
            { userId: 'user-123', role: 'analyst' },
            'test-secret',
            { expiresIn: '1h' }
        )

        mockReq.headers = {
            cookie: `ops_session=${token}`,
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.user).toEqual({
            userId: 'user-123',
            role: 'analyst',
        })
        expect(mockNext).toHaveBeenCalledWith()
    })

    it('should reject missing token', async () => {
        mockReq.headers = {}

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })

    it('should reject malformed JWT', async () => {
        mockReq.headers = {
            cookie: 'ops_session=invalid.token.here',
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })

    it('should reject expired token', async () => {
        const token = jwt.sign(
            { userId: 'user-123', role: 'analyst' },
            'test-secret',
            { expiresIn: '-1h' } // Already expired
        )

        mockReq.headers = {
            cookie: `ops_session=${token}`,
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })

    it('should reject safely when JWT_SECRET is unset (dev fallback)', async () => {
        // Outside production the app falls back to a dev secret rather than
        // crashing, so a token signed with a different secret is unauthorized.
        delete process.env.JWT_SECRET

        const token = jwt.sign(
            { userId: 'user-123', role: 'analyst' },
            'test-secret'
        )

        mockReq.headers = {
            cookie: `ops_session=${token}`,
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })

    it('should handle cookie with multiple values', async () => {
        const token = jwt.sign(
            { userId: 'user-123', role: 'supervisor' },
            'test-secret'
        )

        mockReq.headers = {
            cookie: `other_cookie=value; ops_session=${token}; another=value`,
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockReq.user).toEqual({
            userId: 'user-123',
            role: 'supervisor',
        })
        expect(mockNext).toHaveBeenCalledWith()
    })

    it('should reject token signed with wrong secret', async () => {
        const token = jwt.sign(
            { userId: 'user-123', role: 'analyst' },
            'wrong-secret'
        )

        mockReq.headers = {
            cookie: `ops_session=${token}`,
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })

    it('should handle empty cookie header', async () => {
        mockReq.headers = {
            cookie: '',
        }

        await currentUser(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalledWith(Errors.unauthorized())
        expect(mockReq.user).toBeUndefined()
    })
})
