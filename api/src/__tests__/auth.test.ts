import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser } from './fixtures.js'

describe('POST /api/auth/login', () => {
    let testUserEmail: string
    let testUserPassword: string

    beforeAll(async () => {
        testUserPassword = 'TestPassword123!'
        const user = await createTestUser({
            email: 'test-auth@example.com',
            password: testUserPassword,
        })
        testUserEmail = user.email
    })

    it('should successfully login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUserEmail, password: testUserPassword })

        expect(res.status).toBe(200)

        const setCookie = res.headers['set-cookie'] as unknown as string[]
        expect(setCookie).toBeDefined()
        expect(setCookie[0]).toContain('ops_session=')
        expect(setCookie[0]).toContain('HttpOnly')
        expect(setCookie[0]).toContain('Path=/')
        expect(setCookie[0]).toContain('SameSite=Lax')

        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data).toHaveProperty('name')
        expect(res.body.data).toHaveProperty('email')
        expect(res.body.data).toHaveProperty('role')
        expect(res.body.data).toHaveProperty('createdAt')
        expect(res.body.data).not.toHaveProperty('passwordHash')
    })

    it('should fail login with invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUserEmail, password: 'WrongPassword123!' })

        expect(res.status).toBe(400)
        expect(res.headers['set-cookie']).toBeUndefined()
        expect(res.body.error.message).toContain('Invalid email or password')
    })

    it('should fail login with non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'Password123!' })

        expect(res.status).toBe(400)
        expect(res.body.error.message).toContain('Invalid email or password')
    })

    it('should fail login without email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'Password123!' })

        expect(res.status).toBe(400)
        expect(res.body.error.message).toContain('Email and password are required')
    })

    it('should fail login without password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUserEmail })

        expect(res.status).toBe(400)
        expect(res.body.error.message).toContain('Email and password are required')
    })
})

describe('DELETE /api/auth/logout', () => {
    let sessionCookie: string

    beforeAll(async () => {
        const user = await createTestUser({
            email: 'test-logout@example.com',
            role: 'analyst',
        })
        sessionCookie = createSessionCookie(user.id, user.role)
    })

    it('should clear session cookie on logout', async () => {
        const res = await request(app)
            .delete('/api/auth/logout')
            .set('Cookie', sessionCookie)

        expect(res.status).toBe(204)

        const setCookie = res.headers['set-cookie'] as unknown as string[]
        expect(setCookie).toBeDefined()
        expect(setCookie[0]).toContain('ops_session=')
        expect(setCookie[0]).toContain('Max-Age=0')
    })

    it('should work even without a session cookie', async () => {
        const res = await request(app).delete('/api/auth/logout')
        expect(res.status).toBe(204)
    })
})
