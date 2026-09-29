import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser } from './fixtures.js'

describe('GET /api/users', () => {
    beforeEach(async () => {
        await createTestUser({ name: 'Test Analyst', email: 'analyst@example.com', role: 'analyst' })
        await createTestUser({ name: 'Test Supervisor', email: 'supervisor@example.com', role: 'supervisor' })
    })

    it('should return all users without authentication', async () => {
        const res = await request(app).get('/api/users')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBeGreaterThan(0)

        const user = res.body.data[0]
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('createdAt')
        expect(user).not.toHaveProperty('passwordHash')
        expect(['analyst', 'supervisor']).toContain(user.role)
    })

    it('should return users with both analyst and supervisor roles', async () => {
        const res = await request(app).get('/api/users')

        const roles = res.body.data.map((u: any) => u.role)
        expect(roles).toContain('analyst')
        expect(roles).toContain('supervisor')
    })
})
