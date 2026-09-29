import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as accountsService from '../accounts.js'
import * as accountsRepo from '../../repositories/accounts.js'
import * as memosRepo from '../../repositories/memos.js'
import * as audit from '../../lib/audit.js'
import { Errors } from '../../lib/errors.js'
import type { AuthUser } from '../../types/auth.js'
import type { DbAccount, DbMemoWithAuthor } from '../../types/db.js'

vi.mock('../../repositories/accounts.js')
vi.mock('../../repositories/transactions.js')
vi.mock('../../repositories/memos.js')
vi.mock('../../lib/audit.js')

describe('accounts service', () => {
    const analyst: AuthUser = { userId: 'analyst-id', role: 'analyst' }
    const supervisor: AuthUser = { userId: 'supervisor-id', role: 'supervisor' }

    const mockAccount: DbAccount = {
        id: 'account-123',
        customerName: 'Test Customer',
        accountNumber: '1234567890',
        type: 'checking',
        status: 'active',
        balance: '1000.00',
        openedAt: new Date(),
        createdAt: new Date(),
    }

    beforeEach(() => vi.clearAllMocks())

    describe('listAccounts', () => {
        it('restricts analyst to active and frozen accounts', async () => {
            vi.mocked(accountsRepo.findAccounts).mockResolvedValue({ rows: [mockAccount], total: 1 })

            await accountsService.listAccounts(analyst, { page: 1, pageSize: 10 })

            expect(accountsRepo.findAccounts).toHaveBeenCalledWith({
                page: 1, pageSize: 10, status: ['active', 'frozen'],
            })
        })

        it('allows supervisor to see all statuses', async () => {
            vi.mocked(accountsRepo.findAccounts).mockResolvedValue({ rows: [mockAccount], total: 1 })

            await accountsService.listAccounts(supervisor, { page: 1, pageSize: 10 })

            expect(accountsRepo.findAccounts).toHaveBeenCalledWith({
                page: 1, pageSize: 10, status: ['active', 'frozen', 'closed'],
            })
        })

        it('returns empty result when analyst requests closed accounts', async () => {
            const result = await accountsService.listAccounts(analyst, {
                status: 'closed', page: 1, pageSize: 10,
            })

            expect(result).toEqual({ rows: [], total: 0 })
            expect(accountsRepo.findAccounts).not.toHaveBeenCalled()
        })
    })

    describe('getAccount', () => {
        it('throws forbidden when analyst accesses closed account', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue({ ...mockAccount, status: 'closed' })

            await expect(
                accountsService.getAccount(analyst, 'account-123')
            ).rejects.toThrow(Errors.forbidden())
        })

        it('allows supervisor to access closed account', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue({ ...mockAccount, status: 'closed' })

            const result = await accountsService.getAccount(supervisor, 'account-123')

            expect(result).toMatchObject({ status: 'closed' })
        })

        it('throws not found when account does not exist', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue(null)

            await expect(
                accountsService.getAccount(analyst, 'nonexistent')
            ).rejects.toThrow(Errors.notFound('Account'))
        })
    })

    describe('listTransactions', () => {
        it('enforces RBAC — analyst cannot list transactions on closed account', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue({ ...mockAccount, status: 'closed' })

            await expect(
                accountsService.listTransactions(analyst, 'account-123', { page: 1, pageSize: 10 })
            ).rejects.toThrow(Errors.forbidden())
        })
    })

    describe('addMemo', () => {
        const mockMemo: DbMemoWithAuthor = {
            id: 'memo-1',
            accountId: 'account-123',
            authorId: 'supervisor-id',
            authorName: 'Test Supervisor',
            authorRole: 'supervisor',
            body: 'Test memo content',
            createdAt: new Date(),
        }

        it('allows supervisor to create memo and writes audit log', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue(mockAccount)
            vi.mocked(memosRepo.createMemo).mockResolvedValue(mockMemo)
            vi.mocked(audit.writeAuditLog).mockResolvedValue(undefined)

            await accountsService.addMemo(supervisor, 'account-123', 'Test memo content')

            expect(memosRepo.createMemo).toHaveBeenCalledWith({
                accountId: 'account-123',
                authorId: 'supervisor-id',
                body: 'Test memo content',
            })
            expect(audit.writeAuditLog).toHaveBeenCalled()
        })

        it('throws forbidden when analyst tries to create memo', async () => {
            await expect(
                accountsService.addMemo(analyst, 'account-123', 'Test memo')
            ).rejects.toThrow(Errors.forbidden())

            expect(memosRepo.createMemo).not.toHaveBeenCalled()
            expect(audit.writeAuditLog).not.toHaveBeenCalled()
        })

        it('throws bad request for empty memo body', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue(mockAccount)

            await expect(
                accountsService.addMemo(supervisor, 'account-123', '   ')
            ).rejects.toThrow(Errors.badRequest('Memo body cannot be empty'))
        })

        it('trims whitespace from memo body', async () => {
            vi.mocked(accountsRepo.findAccountById).mockResolvedValue(mockAccount)
            vi.mocked(memosRepo.createMemo).mockResolvedValue(mockMemo)
            vi.mocked(audit.writeAuditLog).mockResolvedValue(undefined)

            await accountsService.addMemo(supervisor, 'account-123', '  Test memo content  ')

            expect(memosRepo.createMemo).toHaveBeenCalledWith(
                expect.objectContaining({ body: 'Test memo content' })
            )
        })
    })
})
