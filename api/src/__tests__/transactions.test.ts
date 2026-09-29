import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { createSessionCookie, createTestUser, createTestAccount, createTestTransaction } from './fixtures.js'

describe('GET /api/transactions', () => {
    let analystSessionCookie: string
    let supervisorSessionCookie: string
    let activeAccountId: string
    let closedAccountId: string

    beforeEach(async () => {
        const analyst = await createTestUser({ role: 'analyst' })
        const supervisor = await createTestUser({ role: 'supervisor' })

        analystSessionCookie = createSessionCookie(analyst.id, analyst.role)
        supervisorSessionCookie = createSessionCookie(supervisor.id, supervisor.role)

        const activeAccount = await createTestAccount({
            status: 'active',
            customerName: 'Active Customer'
        })
        const closedAccount = await createTestAccount({
            status: 'closed',
            customerName: 'Closed Customer'
        })

        activeAccountId = activeAccount.id
        closedAccountId = closedAccount.id

        await createTestTransaction(activeAccountId, {
            amount: '100.00',
            direction: 'credit',
            description: 'Active account credit',
            status: 'posted',
        })
        await createTestTransaction(activeAccountId, {
            amount: '50.00',
            direction: 'debit',
            description: 'Active account debit',
            status: 'pending',
        })
        await createTestTransaction(closedAccountId, {
            amount: '200.00',
            direction: 'credit',
            description: 'Closed account transaction',
            status: 'posted',
        })
    })

    it('should return paginated transactions with correct response shape', async () => {
        const res = await request(app)
            .get('/api/transactions?page=1&pageSize=10')
            .set('Cookie', analystSessionCookie)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body).toHaveProperty('meta')
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.meta).toHaveProperty('total')
        expect(res.body.meta).toHaveProperty('page', 1)
        expect(res.body.meta).toHaveProperty('pageSize', 10)

        expect(res.body.data.length).toBeGreaterThan(0)
        const transaction = res.body.data[0]
        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('accountId')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('direction')
        expect(transaction).toHaveProperty('description')
        expect(transaction).toHaveProperty('postedAt')
        expect(transaction).toHaveProperty('status')
        expect(transaction).toHaveProperty('customerName')
        expect(transaction).toHaveProperty('accountNumber')
    })

    it('should respect pagination limits', async () => {
        const res = await request(app)
            .get('/api/transactions?page=1&pageSize=1')
            .set('Cookie', analystSessionCookie)

        expect(res.body.data.length).toBeLessThanOrEqual(1)
        expect(res.body.meta.pageSize).toBe(1)
    })

    it('should filter by direction', async () => {
        const res = await request(app)
            .get('/api/transactions?direction=credit')
            .set('Cookie', analystSessionCookie)

        res.body.data.forEach((tx: any) => {
            expect(tx.direction).toBe('credit')
        })
    })

    it('should filter by status', async () => {
        const res = await request(app)
            .get('/api/transactions?status=posted')
            .set('Cookie', analystSessionCookie)

        res.body.data.forEach((tx: any) => {
            expect(tx.status).toBe('posted')
        })
    })

    it('should search by customer name', async () => {
        const res = await request(app)
            .get(`/api/transactions?q=${encodeURIComponent('Active Customer')}`)
            .set('Cookie', analystSessionCookie)

        res.body.data.forEach((tx: any) => {
            expect(tx.customerName.toLowerCase()).toContain('active customer')
        })
    })

    it('analyst should not see transactions from closed accounts', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('Cookie', analystSessionCookie)

        const accountIds = res.body.data.map((tx: any) => tx.accountId)
        expect(accountIds).not.toContain(closedAccountId)
    })

    it('supervisor should see transactions from closed accounts', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('Cookie', supervisorSessionCookie)

        const accountIds = res.body.data.map((tx: any) => tx.accountId)
        expect(accountIds).toContain(closedAccountId)
    })

    it('should return 401 without authentication', async () => {
        const res = await request(app).get('/api/transactions')

        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('error')
    })
})
