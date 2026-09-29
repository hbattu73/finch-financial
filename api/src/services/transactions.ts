import type { AuthUser } from '../types/auth.js'
import type { AccountStatus, TransactionDirection, TransactionStatus } from '@shared/types'
import * as transactionsRepo from '../repositories/transactions.js'

const ANALYST_VISIBLE_STATUSES: AccountStatus[] = ['active', 'frozen']
const ALL_STATUSES: AccountStatus[] = ['active', 'frozen', 'closed']

export async function listAllTransactions(
    user: AuthUser,
    opts: {
        q?: string
        direction?: TransactionDirection
        status?: TransactionStatus
        page: number
        pageSize: number
    }
) {
    const allowedAccountStatuses =
        user.role === 'supervisor' ? ALL_STATUSES : ANALYST_VISIBLE_STATUSES

    return transactionsRepo.findAllTransactions({
        ...opts,
        allowedAccountStatuses,
    })
}
