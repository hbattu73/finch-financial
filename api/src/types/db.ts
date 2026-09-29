import type { InferSelectModel } from 'drizzle-orm'
import type { accounts, transactions, memos } from '../db/schema.js'

// Database types inferred from Drizzle schema
// These have Date objects for timestamp fields
export type DbAccount = InferSelectModel<typeof accounts>
export type DbTransaction = InferSelectModel<typeof transactions>
export type DbMemo = InferSelectModel<typeof memos>

// Extended types with joins
export type DbTransactionWithAccount = DbTransaction & {
    customerName: string
    accountNumber: string
}

export type DbMemoWithAuthor = DbMemo & {
    authorName: string
    authorRole: 'analyst' | 'supervisor'
}
