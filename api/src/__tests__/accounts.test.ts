import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser, createTestAccount } from './fixtures.js'

describe('GET /api/accounts', () => {
    let analystSessionCookie: string
    let supervisorSessionCookie: string

    beforeEach(async () => {
        const analyst = await createTestUser({ role: 'analyst' })
        const supervisor = await createTestUser({ role: 'supervisor' })

        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        await createTestAccount({ status: 'active', customerName: 'Active Customer' })
        await createTestAccount({ status: 'frozen', customerName: 'Frozen Customer' })
        await createTestAccount({ status: 'closed', customerName: 'Closed Customer' })
    })

    it('returns paginated accounts with correct response shape', async () => {
        const res = await request(app)
            .get('/api/accounts?page=1&pageSize=5')
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(200)

        expect(res.body).toHaveProperty('data')
        expect(res.body).toHaveProperty('meta')
        expect(Array.isArray(res.body.data)).toBe(true)

        expect(res.body.meta).toHaveProperty('total')
        expect(res.body.meta).toHaveProperty('page', 1)
        expect(res.body.meta).toHaveProperty('pageSize', 5)
        expect(typeof res.body.meta.total).toBe('number')

        expect(res.body.data.length).toBeGreaterThan(0)
        const account = res.body.data[0]
        expect(account).toHaveProperty('id')
        expect(account).toHaveProperty('customerName')
        expect(account).toHaveProperty('accountNumber')
        expect(account).toHaveProperty('type')
        expect(account).toHaveProperty('balance')
        expect(account).toHaveProperty('status')
        expect(account).toHaveProperty('openedAt')
        expect(account).toHaveProperty('createdAt')
    })

    it('respects pagination limits', async () => {
        const res = await request(app)
            .get('/api/accounts?page=1&pageSize=2')
            .set('Cookie', analystSessionCookie)

        expect(res.body.data.length).toBeLessThanOrEqual(2)
        expect(res.body.meta.pageSize).toBe(2)
    })

    it('returns 401 without authentication', async () => {
        const res = await request(app).get('/api/accounts')

        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toHaveProperty('code')
        expect(res.body.error).toHaveProperty('message')
    })

    it('analyst cannot see closed accounts', async () => {
        const res = await request(app)
            .get('/api/accounts')
            .set('Cookie', analystSessionCookie)

        const statuses = res.body.data.map((a: any) => a.status)
        expect(statuses).not.toContain('closed')
    })

    it('supervisor can see closed accounts', async () => {
        const res = await request(app)
            .get('/api/accounts')
            .set('Cookie', supervisorSessionCookie)

        const statuses = res.body.data.map((a: any) => a.status)
        expect(statuses).toContain('closed')
    })
})
