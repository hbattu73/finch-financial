// ============================================================
// Shared Types — single source of truth for API contracts
// Both `api/` and `web/` import from this file via @shared/types
//
// When adding new endpoints or modifying existing ones:
// 1. Update this file first
// 2. Then update api/ to implement
// 3. Then update web/ to consume
// This order is intentional — the type is the spec.
// ============================================================

// ---------------------------
// Enums (as union types)
// ---------------------------

export type Role = 'analyst' | 'supervisor'

export type AccountType = 'checking' | 'savings'

export type AccountStatus = 'active' | 'frozen' | 'closed'

export type TransactionDirection = 'credit' | 'debit'

export type TransactionStatus = 'posted' | 'pending'

export type AuditEntityType = 'account' | 'transaction' | 'memo'

// ---------------------------
// Domain types
// ---------------------------

export interface User {
    id: string
    name: string
    email: string  // display only — not used for auth
    role: Role
    createdAt: string
}

export interface Account {
    id: string
    customerName: string
    accountNumber: string  // pre-masked, e.g. "****-****-****-4471"
    type: AccountType
    balance: string        // pg numeric returns as string — format on display, never coerce to float
    status: AccountStatus
    openedAt: string
    createdAt: string
}

export interface Transaction {
    id: string
    accountId: string
    amount: string         // same as balance — keep as string
    direction: TransactionDirection
    description: string
    postedAt: string
    status: TransactionStatus
    createdAt: string
}

export interface TransactionWithAccount extends Transaction {
    customerName: string   // joined from accounts
    accountNumber: string  // joined from accounts
}

export interface Memo {
    id: string
    accountId: string
    authorId: string
    authorName: string     // joined from users table
    authorRole: Role       // joined from users table
    body: string
    createdAt: string
}

export interface AuditEntry {
    id: string
    actorId: string
    actorName: string
    actorRole: Role
    entityType: AuditEntityType
    entityId: string
    action: string
    payload: Record<string, unknown>
    createdAt: string
}

// ---------------------------
// Request shapes
// ---------------------------

export interface MemoCreateRequest {
    body: string
}

// ---------------------------
// Query parameter shapes
// ---------------------------

export interface PaginationQuery {
    page?: number
    pageSize?: number
}

export interface AccountListQuery extends PaginationQuery {
    status?: AccountStatus
    q?: string             // search by customer name
}

export interface TransactionListQuery extends PaginationQuery {
    q?: string                      // search by customer name
    direction?: TransactionDirection
    status?: TransactionStatus
}

// ---------------------------
// Response envelope shapes
// ---------------------------

export interface ApiError {
    code: string
    message: string
}

export interface ErrorResponse {
    error: ApiError
}

export interface ListMeta {
    total: number
    page: number
    pageSize: number
}

export interface ListResponse<T> {
    data: T[]
    meta: ListMeta
}

export interface SingleResponse<T> {
    data: T
}