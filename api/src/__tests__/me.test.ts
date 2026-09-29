import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser } from './fixtures.js'

describe('GET /api/me', () => {
    let analystSessionCookie: string
    let supervisorSessionCookie: string
    let analystUserId: string
    let supervisorUserId: string

    beforeEach(async () => {
        const analyst = await createTestUser({
            name: 'Test Analyst',
            email: 'analyst@example.com',
            role: 'analyst',
        })
        const supervisor = await createTestUser({
            name: 'Test Supervisor',
            email: 'supervisor@example.com',
            role: 'supervisor',
        })

        analystUserId = analyst.id
        supervisorUserId = supervisor.id

        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)
    })

    it('should return current user for analyst', async () => {
        const res = await request(app)
            .get('/api/me')
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('id', analystUserId)
        expect(res.body.data).toHaveProperty('name', 'Test Analyst')
        expect(res.body.data).toHaveProperty('email', 'analyst@example.com')
        expect(res.body.data).toHaveProperty('role', 'analyst')
        expect(res.body.data).toHaveProperty('createdAt')
        expect(res.body.data).not.toHaveProperty('passwordHash')
    })

    it('should return current user for supervisor', async () => {
        const res = await request(app)
            .get('/api/me')
            .set('Cookie', supervisorSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('id', supervisorUserId)
        expect(res.body.data).toHaveProperty('role', 'supervisor')
    })

    it('should return 401 without authentication', async () => {
        const res = await request(app).get('/api/me')

        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('error')
    })

    it('should return 401 with invalid session cookie', async () => {
        const res = await request(app)
            .get('/api/me')
            .set('Cookie', 'ops_session=invalid_token')

        expect(res.status).toBe(401)
    })
})
