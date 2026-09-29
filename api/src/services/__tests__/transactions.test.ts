import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as transactionsService from '../transactions.js'
import * as transactionsRepo from '../../repositories/transactions.js'
import type { AuthUser } from '../../types/auth.js'
import type { DbTransactionWithAccount } from '../../types/db.js'

vi.mock('../../repositories/transactions.js')

describe('transactions service', () => {
    const analyst: AuthUser = { userId: 'analyst-id', role: 'analyst' }
    const supervisor: AuthUser = { userId: 'supervisor-id', role: 'supervisor' }

    const mockResult: { rows: DbTransactionWithAccount[]; total: number } = {
        rows: [],
        total: 0,
    }

    beforeEach(() => vi.clearAllMocks())

    describe('listAllTransactions', () => {
        it('restricts analyst to active and frozen accounts', async () => {
            vi.mocked(transactionsRepo.findAllTransactions).mockResolvedValue(mockResult)

            await transactionsService.listAllTransactions(analyst, { page: 1, pageSize: 10 })

            expect(transactionsRepo.findAllTransactions).toHaveBeenCalledWith(
                expect.objectContaining({ allowedAccountStatuses: ['active', 'frozen'] })
            )
        })

        it('allows supervisor to see all account statuses', async () => {
            vi.mocked(transactionsRepo.findAllTransactions).mockResolvedValue(mockResult)

            await transactionsService.listAllTransactions(supervisor, { page: 1, pageSize: 10 })

            expect(transactionsRepo.findAllTransactions).toHaveBeenCalledWith(
                expect.objectContaining({ allowedAccountStatuses: ['active', 'frozen', 'closed'] })
            )
        })
    })
})
