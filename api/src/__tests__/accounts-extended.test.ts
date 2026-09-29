import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser, createTestAccount, createTestMemo } from './fixtures.js'

describe('GET /api/accounts/:id', () => {
    let analystSessionCookie: string
    let supervisorSessionCookie: string
    let activeAccountId: string
    let closedAccountId: string

    beforeEach(async () => {
        const analyst = await createTestUser({ role: 'analyst' })
        const supervisor = await createTestUser({ role: 'supervisor' })

        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        const activeAccount = await createTestAccount({ status: 'active' })
        const closedAccount = await createTestAccount({ status: 'closed' })

        activeAccountId = activeAccount.id
        closedAccountId = closedAccount.id
    })

    it('should return account details for active account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${activeAccountId}`)
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('id', activeAccountId)
        expect(res.body.data).toHaveProperty('customerName')
        expect(res.body.data).toHaveProperty('status', 'active')
    })

    it('should return 403 when analyst tries to view closed account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${closedAccountId}`)
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
    })

    it('should allow supervisor to view closed account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${closedAccountId}`)
            .set('Cookie', supervisorSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('status', 'closed')
    })

    it('should return 404 for non-existent account', async () => {
        const res = await request(app)
            .get('/api/accounts/00000000-0000-0000-0000-000000000000')
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(404)
    })
})

describe('GET /api/accounts/:id/memos', () => {
    let supervisorSessionCookie: string
    let accountId: string

    beforeEach(async () => {
        const supervisor = await createTestUser({ role: 'supervisor' })
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        const account = await createTestAccount({ status: 'active' })
        accountId = account.id

        await createTestMemo(accountId, supervisor.id, { body: 'First memo' })
        await createTestMemo(accountId, supervisor.id, { body: 'Second memo' })
    })

    it('should return all memos for an account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${accountId}/memos`)
            .set('Cookie', supervisorSessionCookie)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBe(2)

        const memo = res.body.data[0]
        expect(memo).toHaveProperty('id')
        expect(memo).toHaveProperty('accountId', accountId)
        expect(memo).toHaveProperty('authorId')
        expect(memo).toHaveProperty('authorName')
        expect(memo).toHaveProperty('authorRole')
        expect(memo).toHaveProperty('body')
        expect(memo).toHaveProperty('createdAt')
    })

    it('should return empty array when no memos exist', async () => {
        const newAccount = await createTestAccount({ status: 'active' })

        const res = await request(app)
            .get(`/api/accounts/${newAccount.id}/memos`)
            .set('Cookie', supervisorSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body.data).toEqual([])
    })
})

describe('POST /api/accounts/:id/memos', () => {
    let analystSessionCookie: string
    let supervisorSessionCookie: string
    let accountId: string

    beforeEach(async () => {
        const analyst = await createTestUser({ role: 'analyst' })
        const supervisor = await createTestUser({ role: 'supervisor' })

        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        const account = await createTestAccount({ status: 'active' })
        accountId = account.id
    })

    it('should allow supervisor to create memo', async () => {
        const res = await request(app)
            .post(`/api/accounts/${accountId}/memos`)
            .set('Cookie', supervisorSessionCookie)
            .send({ body: 'Test memo content' })

        expect(res.status).toBe(201)
        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data).toHaveProperty('body', 'Test memo content')
        expect(res.body.data).toHaveProperty('accountId', accountId)
    })

    it('should return 403 when analyst tries to create memo', async () => {
        const res = await request(app)
            .post(`/api/accounts/${accountId}/memos`)
            .set('Cookie', analystSessionCookie)
            .send({ body: 'Test memo content' })

        expect(res.status).toBe(403)
    })

    it('should return 400 when body is missing', async () => {
        const res = await request(app)
            .post(`/api/accounts/${accountId}/memos`)
            .set('Cookie', supervisorSessionCookie)
            .send({})

        expect(res.status).toBe(400)
    })
})

describe('GET /api/accounts/:id/audit-log', () => {
    let supervisorSessionCookie: string
    let accountId: string

    beforeEach(async () => {
        const supervisor = await createTestUser({ role: 'supervisor' })
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        const account = await createTestAccount({ status: 'active' })
        accountId = account.id

        // POST via the route so the service layer writes the audit log entry
        await request(app)
            .post(`/api/accounts/${accountId}/memos`)
            .set('Cookie', supervisorSessionCookie)
            .send({ body: 'Test memo for audit log' })
    })

    it('should return audit log entries for an account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${accountId}/audit-log?page=1&pageSize=10`)
            .set('Cookie', supervisorSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body).toHaveProperty('meta')
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBeGreaterThan(0)

        const entry = res.body.data[0]
        expect(entry).toHaveProperty('id')
        expect(entry).toHaveProperty('actorId')
        expect(entry).toHaveProperty('actorName')
        expect(entry).toHaveProperty('actorRole')
        expect(entry).toHaveProperty('entityType')
        expect(entry).toHaveProperty('entityId')
        expect(entry).toHaveProperty('action')
        expect(entry).toHaveProperty('payload')
        expect(entry).toHaveProperty('createdAt')
    })

    it('should respect pagination', async () => {
        const res = await request(app)
            .get(`/api/accounts/${accountId}/audit-log?page=1&pageSize=5`)
            .set('Cookie', supervisorSessionCookie)

        expect(res.body.meta.pageSize).toBe(5)
        expect(res.body.data.length).toBeLessThanOrEqual(5)
    })
})

describe('GET /api/accounts/:id/transactions', () => {
    let analystSessionCookie: string
    let accountId: string

    beforeEach(async () => {
        const analyst = await createTestUser({ role: 'analyst' })
        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)

        const account = await createTestAccount({ status: 'active' })
        accountId = account.id
    })

    it('should return transactions for an account', async () => {
        const res = await request(app)
            .get(`/api/accounts/${accountId}/transactions?page=1&pageSize=10`)
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body).toHaveProperty('meta')
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.meta).toHaveProperty('total')
        expect(res.body.meta).toHaveProperty('page', 1)
        expect(res.body.meta).toHaveProperty('pageSize', 10)
    })
})
