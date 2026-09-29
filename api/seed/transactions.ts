import type { InferInsertModel } from 'drizzle-orm'
import type { transactions } from '../src/db/schema.js'

export type NewTransaction = InferInsertModel<typeof transactions>

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
}

function pick<T>(arr: T[]): T {
    const item = arr[Math.floor(Math.random() * arr.length)]
    if (!item) throw new Error('Cannot pick from empty array')
    return item
}

interface AccountInfo {
    id: string
    name: string
}

export function buildSeedTransactions(accounts: AccountInfo[]): NewTransaction[] {
    const txns: NewTransaction[] = []

    const bigBread = accounts.find(a => a.name.includes('Big Bread'))
    const northgate = accounts.find(a => a.name.includes('Northgate'))
    const tran = accounts.find(a => a.name.includes('Tran Consulting'))
    const elena = accounts.find(a => a.name.includes('Elena'))
    const daniel = accounts.find(a => a.name.includes('Daniel'))

    // Big Bread Bakery — 15 credits, classic structuring pattern (sub-$10k)
    if (bigBread) {
        for (let i = 0; i < 15; i++) {
            txns.push({
                accountId: bigBread.id,
                amount: (8000 + Math.random() * 1800).toFixed(2),
                direction: 'credit',
                description: 'CASH DEPOSIT — BRANCH 0042',
                postedAt: daysAgo(randomBetween(0, 60)),
                status: 'posted',
            })
        }
    }

    // Northgate Properties — 8 transactions, one large suspicious wire
    if (northgate) {
        txns.push({
            accountId: northgate.id,
            amount: '280000.00',
            direction: 'debit',
            description: 'WIRE OUT — CAYMAN HOLDINGS LTD REF#NP-2291',
            postedAt: daysAgo(randomBetween(3, 7)),
            status: 'posted',
        })

        const northgateCredits = [
            'ACH CREDIT — TENANT RENT PAYMENT',
            'WIRE IN — PROPERTY SALE PROCEEDS',
            'ACH CREDIT — MANAGEMENT FEE',
        ]
        const northgateDebits = [
            'ACH DEBIT — PROPERTY MAINTENANCE',
            'ACH DEBIT UTILITIES — MULTI-UNIT',
            'ACH DEBIT — INSURANCE PMT',
            'POS DEBIT WHOLEFDS MKT #0441',
        ]

        for (let i = 0; i < 7; i++) {
            const direction = i < 3 ? 'credit' : 'debit'
            txns.push({
                accountId: northgate.id,
                amount: (randomBetween(2000, 15000) + Math.random()).toFixed(2),
                direction,
                description: direction === 'credit'
                    ? pick(northgateCredits)
                    : pick(northgateDebits),
                postedAt: daysAgo(randomBetween(0, 14)),
                status: 'posted',
            })
        }
    }

    // Tran Consulting Group — 10 alternating wires, sequential ref numbers (layering)
    if (tran) {
        const tranDescriptions = [
            { direction: 'credit', description: 'WIRE IN — CORRESPONDENT BANK REF#TC-4412' },
            { direction: 'debit', description: 'WIRE OUT — INTERNATIONAL REF#TC-4413' },
            { direction: 'credit', description: 'WIRE IN — CORRESPONDENT BANK REF#TC-4489' },
            { direction: 'debit', description: 'WIRE OUT — INTERNATIONAL REF#TC-4490' },
            { direction: 'credit', description: 'WIRE IN — CORRESPONDENT BANK REF#TC-4501' },
            { direction: 'debit', description: 'WIRE OUT — INTERNATIONAL REF#TC-4502' },
            { direction: 'credit', description: 'WIRE IN — CORRESPONDENT BANK REF#TC-4519' },
            { direction: 'debit', description: 'WIRE OUT — INTERNATIONAL REF#TC-4520' },
            { direction: 'credit', description: 'WIRE IN — CORRESPONDENT BANK REF#TC-4531' },
            { direction: 'debit', description: 'WIRE OUT — INTERNATIONAL REF#TC-4532' },
        ] as const

        tranDescriptions.forEach((t) => {
            txns.push({
                accountId: tran.id,
                amount: (randomBetween(5000, 25000) + Math.random()).toFixed(2),
                direction: t.direction,
                description: t.description,
                postedAt: daysAgo(randomBetween(0, 5)),
                status: 'posted',
            })
        })
    }

    // Elena Vasquez — 6 transactions, duplicate refund pair
    if (elena) {
        txns.push({
            accountId: elena.id,
            amount: '1247.50',
            direction: 'credit',
            description: 'ACH CREDIT REFUND — OVERPAYMENT',
            postedAt: daysAgo(8),
            status: 'posted',
        })
        txns.push({
            accountId: elena.id,
            amount: '1247.50',
            direction: 'credit',
            description: 'ACH CREDIT REFUND — OVERPAYMENT',
            postedAt: daysAgo(7),
            status: 'posted',
        })

        const elenaDescriptions = [
            { direction: 'credit' as const, description: 'ACH CREDIT PAYROLL' },
            { direction: 'debit' as const, description: 'ACH DEBIT RENT — MONTHLY' },
            { direction: 'debit' as const, description: 'POS DEBIT WHOLEFDS MKT #0441' },
            { direction: 'debit' as const, description: 'ACH DEBIT UTILITIES — AUTO PAY' },
        ]

        elenaDescriptions.forEach(t => {
            txns.push({
                accountId: elena.id,
                amount: (randomBetween(100, 3000) + Math.random()).toFixed(2),
                direction: t.direction,
                description: t.description,
                postedAt: daysAgo(randomBetween(0, 14)),
                status: 'posted',
            })
        })
    }

    // Daniel Okafor — 12 transactions, high velocity on new account (~20% pending)
    if (daniel) {
        const danielDescriptions = [
            { direction: 'debit' as const, description: 'ZELLE TRANSFER SENT' },
            { direction: 'debit' as const, description: 'POS DEBIT SHELL OIL #7731' },
            { direction: 'credit' as const, description: 'ZELLE TRANSFER RECEIVED' },
            { direction: 'debit' as const, description: 'DOORDASH *TOCO TOCO 2:47AM' },
            { direction: 'debit' as const, description: 'ATM WITHDRAWAL — NON-NETWORK FEE APPLIED' },
            { direction: 'credit' as const, description: 'MOBILE DEPOSIT — CHECK' },
            { direction: 'debit' as const, description: 'POS DEBIT WHOLEFDS MKT #0441' },
            { direction: 'debit' as const, description: 'ZELLE TRANSFER SENT' },
            { direction: 'credit' as const, description: 'ACH CREDIT — VENDOR PAYMENT' },
            { direction: 'debit' as const, description: 'POS DEBIT SHELL OIL #7731' },
            { direction: 'debit' as const, description: 'ZELLE TRANSFER SENT' },
            { direction: 'debit' as const, description: 'ATM WITHDRAWAL — NON-NETWORK FEE APPLIED' },
        ]

        danielDescriptions.forEach((t, i) => {
            txns.push({
                accountId: daniel.id,
                amount: (randomBetween(10, 500) + Math.random()).toFixed(2),
                direction: t.direction,
                description: t.description,
                postedAt: daysAgo(randomBetween(0, 14)),
                status: i % 5 === 0 ? 'pending' : 'posted',
            })
        })
    }

    // Remaining 5 accounts — 24 normal background transactions
    const remainingAccounts = accounts.filter(a =>
        a !== bigBread && a !== northgate && a !== tran && a !== elena && a !== daniel
    )

    const creditDescriptions = [
        'ACH CREDIT PAYROLL',
        'WIRE IN REF#TXN-2291-B',
        'MOBILE DEPOSIT — CHECK',
        'ACH CREDIT REFUND — OVERPAYMENT',
        'ZELLE TRANSFER RECEIVED',
        'ACH CREDIT — VENDOR PAYMENT',
    ]

    const debitDescriptions = [
        'ACH DEBIT RENT — MONTHLY',
        'POS DEBIT WHOLEFDS MKT #0441',
        'ATM WITHDRAWAL — NON-NETWORK FEE APPLIED',
        'ACH DEBIT — INSURANCE PMT',
        'POS DEBIT SHELL OIL #7731',
        'ACH DEBIT UTILITIES — AUTO PAY',
        'DOORDASH *TOCO TOCO 2:47AM',
        'ACH DEBIT — RECURRING SUBSCRIPTION',
    ]

    for (let i = 0; i < 24; i++) {
        const account = remainingAccounts[i % remainingAccounts.length]
        if (!account) continue
        const direction = Math.random() > 0.4 ? 'debit' : 'credit'
        txns.push({
            accountId: account.id,
            amount: (randomBetween(10, 5000) + Math.random()).toFixed(2),
            direction,
            description: pick(direction === 'credit' ? creditDescriptions : debitDescriptions),
            postedAt: daysAgo(randomBetween(0, 14)),
            status: Math.random() > 0.9 ? 'pending' : 'posted',
        })
    }

    return txns
}
