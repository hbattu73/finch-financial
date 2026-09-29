import type { AuthUser } from '../types/auth.js'
import type { AccountStatus } from '@shared/types'
import { Errors } from '../lib/errors.js'
import { writeAuditLog } from '../lib/audit.js'
import * as accountsRepo from '../repositories/accounts.js'
import * as transactionsRepo from '../repositories/transactions.js'
import * as memosRepo from '../repositories/memos.js'

const ANALYST_VISIBLE_STATUSES: AccountStatus[] = ['active', 'frozen']
const ALL_STATUSES: AccountStatus[] = ['active', 'frozen', 'closed']

export async function listAccounts(
    user: AuthUser,
    opts: { status?: AccountStatus; q?: string; page: number; pageSize: number }
) {
    const allowedStatuses =
        user.role === 'supervisor' ? ALL_STATUSES : ANALYST_VISIBLE_STATUSES

    if (opts.status && !allowedStatuses.includes(opts.status)) {
        return { rows: [], total: 0 }
    }

    const status = opts.status ?? allowedStatuses

    return accountsRepo.findAccounts({
        page: opts.page,
        pageSize: opts.pageSize,
        ...(opts.q && { q: opts.q }),
        status,
    })
}

export async function getAccount(user: AuthUser, id: string) {
    const account = await accountsRepo.findAccountById(id)

    if (!account) throw Errors.notFound('Account')

    if (user.role === 'analyst' && account.status === 'closed') {
        throw Errors.forbidden()
    }

    return account
}

export async function listTransactions(
    user: AuthUser,
    accountId: string,
    opts: { page: number; pageSize: number }
) {
    await getAccount(user, accountId)
    return transactionsRepo.findTransactionsByAccount({ accountId, ...opts })
}

export async function listMemos(user: AuthUser, accountId: string) {
    await getAccount(user, accountId)
    return memosRepo.findMemosByAccount(accountId)
}

export async function addMemo(
    user: AuthUser,
    accountId: string,
    body: string
) {
    if (user.role !== 'supervisor') throw Errors.forbidden()
    await getAccount(user, accountId)

    if (!body.trim()) throw Errors.badRequest('Memo body cannot be empty')

    const memo = await memosRepo.createMemo({
        accountId,
        authorId: user.userId,
        body: body.trim(),
    })

    await writeAuditLog({
        actorId: user.userId,
        entityType: 'account',
        entityId: accountId,
        action: 'memo.created',
        payload: {
            memoId: memo?.id,
            body: body.trim(),
        },
    })

    return memo
}
