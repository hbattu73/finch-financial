import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getJwtSecret } from '../config.js'

describe('getJwtSecret', () => {
    const originalSecret = process.env.JWT_SECRET
    const originalNodeEnv = process.env.NODE_ENV

    beforeEach(() => {
        delete process.env.JWT_SECRET
    })

    afterEach(() => {
        if (originalSecret === undefined) delete process.env.JWT_SECRET
        else process.env.JWT_SECRET = originalSecret

        if (originalNodeEnv === undefined) delete process.env.NODE_ENV
        else process.env.NODE_ENV = originalNodeEnv
    })

    it('returns the configured secret when one is set', () => {
        process.env.JWT_SECRET = 'a-real-secret'
        expect(getJwtSecret()).toBe('a-real-secret')
    })

    it('falls back to a dev secret outside production', () => {
        process.env.NODE_ENV = 'development'
        expect(getJwtSecret()).toBe('workshop-dev-secret')
    })

    it('throws in production when no secret is configured', () => {
        process.env.NODE_ENV = 'production'
        expect(() => getJwtSecret()).toThrow('JWT_SECRET is not configured')
    })

    it('prefers a configured secret over the dev fallback in production', () => {
        process.env.NODE_ENV = 'production'
        process.env.JWT_SECRET = 'prod-secret'
        expect(getJwtSecret()).toBe('prod-secret')
    })
})
