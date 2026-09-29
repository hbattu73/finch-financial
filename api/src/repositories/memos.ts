import { db } from '../db/client.js'
import { memos, users } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

export async function findMemosByAccount(accountId: string) {
    return db
        .select({
            id: memos.id,
            accountId: memos.accountId,
            authorId: memos.authorId,
            authorName: users.name,
            authorRole: users.role,
            body: memos.body,
            createdAt: memos.createdAt,
        })
        .from(memos)
        .leftJoin(users, eq(memos.authorId, users.id))
        .where(eq(memos.accountId, accountId))
        .orderBy(desc(memos.createdAt))
}

export async function createMemo(data: {
    accountId: string
    authorId: string
    body: string
}) {
    const result = await db.insert(memos).values(data).returning()
    const memo = result[0]
    
    if (!memo) return null
    
    // Fetch the memo with author details
    const memoWithAuthor = await db
        .select({
            id: memos.id,
            accountId: memos.accountId,
            authorId: memos.authorId,
            authorName: users.name,
            authorRole: users.role,
            body: memos.body,
            createdAt: memos.createdAt,
        })
        .from(memos)
        .leftJoin(users, eq(memos.authorId, users.id))
        .where(eq(memos.id, memo.id))
        .limit(1)
    
    const row = memoWithAuthor[0]
    if (!row) return null
    
    // Handle potential nulls from leftJoin
    return {
        ...row,
        authorName: row.authorName ?? 'Unknown',
        authorRole: (row.authorRole ?? 'analyst') as 'analyst' | 'supervisor',
    }
}