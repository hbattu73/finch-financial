export function buildSeedMemos(
    accountIds: string[],
    supervisorIds: string[]
): { accountId: string; authorId: string; body: string; createdAt: Date }[] {
    if (accountIds.length < 10 || supervisorIds.length < 3) {
        throw new Error('Insufficient accounts or supervisors for seed memos')
    }

    return [
        {
            accountId: accountIds[2]!, // Big Bread Bakery
            authorId: supervisorIds[0]!, // Marcus Webb
            body: 'Flagged for structuring review. Account shows 15 cash deposits over 60 days, all between $8,000–$9,800. Pattern is consistent with deliberate sub-threshold deposits. Freezing pending compliance review.',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago — mid-window, after pattern noticed
        },
        {
            accountId: accountIds[2]!, // Big Bread Bakery
            authorId: supervisorIds[1]!, // Jordan Ellis
            body: 'Spoke with account holder. Unable to provide satisfactory business explanation for cash deposit frequency. Compliance notified. Freeze extended pending SAR filing decision.',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago — 5 days after memo 1
        },
        {
            accountId: accountIds[8]!, // Tran Consulting Group
            authorId: supervisorIds[0]!, // Marcus Webb
            body: 'Account frozen following detection of rapid international wire pattern — 10 wires in and out over 72 hours, alternating with correspondent bank. Total volume $147,000. Possible layering. Escalated to BSA officer.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday — wires are within last 5 days
        },
        {
            accountId: accountIds[4]!, // Northgate Properties
            authorId: supervisorIds[2]!, // Dana Frost
            body: 'Single wire out $280,000 to Cayman Holdings Ltd. No prior history of large international wires on this account. Customer unreachable — three callback attempts made. Wire processed as it was within account limits but flagging for follow-up review.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday — wire is 3–7 days ago
        },
        {
            accountId: accountIds[9]!, // Daniel Okafor
            authorId: supervisorIds[1]!, // Jordan Ellis
            body: 'New account monitoring — 12 transactions in first 14 days on a $3,240 balance. High velocity for account age. No individual transaction is suspicious but pattern warrants 30-day monitoring period.',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago — transactions span last 14 days
        },
        {
            accountId: accountIds[0]!, // Acme Logistics LLC
            authorId: supervisorIds[2]!, // Dana Frost
            body: 'Customer called to confirm large wire transfer was legitimate. Verified against known vendor list. No action needed.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
            accountId: accountIds[3]!, // Omar Shaikh
            authorId: supervisorIds[0]!, // Marcus Webb
            body: 'Customer requested statement copy for mortgage application. Sent via secure email.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
    ]
}
