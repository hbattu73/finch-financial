import type {
    User,
    Account,
    Transaction,
    TransactionWithAccount,
    Memo,
    AuditEntry,
    AccountListQuery,
    TransactionListQuery,
    MemoCreateRequest,
    ListResponse,
    SingleResponse,
    ErrorResponse,
} from '@shared/types'

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000'

export class ApiError extends Error {
    readonly code: string
    readonly status: number

    constructor(
        code: string,
        message: string,
        status: number
    ) {
        super(message)
        this.name = 'ApiError'
        this.code = code
        this.status = status
    }
}

async function request<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include', // send session cookie
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!res.ok) {
        const body = (await res.json()) as ErrorResponse
        throw new ApiError(
            body.error.code,
            body.error.message,
            res.status
        )
    }

    return res.json() as Promise<T>
}

// --- Session ---

export async function getUsers(): Promise<ListResponse<User>> {
    return request<ListResponse<User>>('/api/users')
}

export async function login(credentials: {
    email: string
    password: string
}): Promise<SingleResponse<User>> {
    return request<SingleResponse<User>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    })
}

export async function logout(): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) {
        throw new ApiError('LOGOUT_FAILED', 'Logout failed', res.status)
    }
}

export async function getMe(): Promise<SingleResponse<User>> {
    return request<SingleResponse<User>>('/api/me')
}

// --- Accounts ---

export async function getAccounts(
    query: AccountListQuery = {}
): Promise<ListResponse<Account>> {
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.q) params.set('q', query.q)
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return request<ListResponse<Account>>(`/api/accounts${qs ? `?${qs}` : ''}`)
}

export async function getAccount(id: string): Promise<SingleResponse<Account>> {
    return request<SingleResponse<Account>>(`/api/accounts/${id}`)
}

// --- Transactions ---

export async function getTransactions(
    accountId: string,
    query: { page?: number; pageSize?: number } = {}
): Promise<ListResponse<Transaction>> {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return request<ListResponse<Transaction>>(
        `/api/accounts/${accountId}/transactions${qs ? `?${qs}` : ''}`
    )
}

export async function getAllTransactions(
    query: TransactionListQuery = {}
): Promise<ListResponse<TransactionWithAccount>> {
    const params = new URLSearchParams()
    if (query.q) params.set('q', query.q)
    if (query.direction) params.set('direction', query.direction)
    if (query.status) params.set('status', query.status)
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return request<ListResponse<TransactionWithAccount>>(
        `/api/transactions${qs ? `?${qs}` : ''}`
    )
}

// --- Memos ---

export async function getMemos(accountId: string): Promise<ListResponse<Memo>> {
    return request<ListResponse<Memo>>(`/api/accounts/${accountId}/memos`)
}

export async function createMemo(
    accountId: string,
    data: MemoCreateRequest
): Promise<SingleResponse<Memo>> {
    return request<SingleResponse<Memo>>(`/api/accounts/${accountId}/memos`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

// --- Audit Log ---

export async function getAuditLog(
    accountId: string,
    query: { page?: number; pageSize?: number } = {}
): Promise<ListResponse<AuditEntry>> {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return request<ListResponse<AuditEntry>>(
        `/api/accounts/${accountId}/audit-log${qs ? `?${qs}` : ''}`
    )
}