import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Account, Transaction, Memo } from '@shared/types'
import { getAccount, getTransactions, getMemos, createMemo } from '../api'
import DataTable from '../components/DataTable'
import ActivityFeed from '../components/ActivityFeed'
import { ApiError } from '../api'

type Tab = 'transactions' | 'memos' | 'audit log'

const TAB_LABELS: Record<Tab, string> = {
    transactions: 'Transactions',
    memos: 'Memos',
    'audit log': 'Audit Log',
}

const STATUS_TEXT: Record<string, string> = {
    active: 'text-green-400',
    frozen: 'text-red-400',
    closed: 'text-gray-500',
}

const AccountDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [account, setAccount] = useState<Account | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [memos, setMemos] = useState<Memo[]>([])
    const [activeTab, setActiveTab] = useState<Tab>('transactions')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // memo form
    const [memoBody, setMemoBody] = useState('')
    const [memoSubmitting, setMemoSubmitting] = useState(false)
    const [memoError, setMemoError] = useState<string | null>(null)
    const [isSupervisor, setIsSupervisor] = useState(false)

    useEffect(() => {
        if (!id) return

        setLoading(true)
        setError(null)

        Promise.all([
            getAccount(id),
            getTransactions(id),
            getMemos(id),
        ])
            .then(([accountRes, txRes, memoRes]) => {
                setAccount(accountRes.data)
                setTransactions(txRes.data)
                setMemos(memoRes.data)
            })
            .catch(err => {
                if (err instanceof ApiError && err.status === 404) {
                    navigate('/accounts')
                } else {
                    setError(err instanceof Error ? err.message : 'Failed to load account')
                }
            })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        // check current user role from the session cookie via Layout's user state
        // we infer supervisor status from whether memos can be added
        // this is set after first memo attempt or by checking /api/me
        import('../api').then(({ getMe }) => {
            getMe()
                .then(res => setIsSupervisor(res.data.role === 'supervisor'))
                .catch(() => setIsSupervisor(false))
        })
    }, [])

    const handleAddMemo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id || !memoBody.trim()) return

        setMemoSubmitting(true)
        setMemoError(null)

        try {
            const res = await createMemo(id, { body: memoBody.trim() })
            setMemos(prev => [res.data, ...prev])
            setMemoBody('')
        } catch (err) {
            setMemoError(
                err instanceof Error ? err.message : 'Failed to add memo'
            )
        } finally {
            setMemoSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-400 text-sm">
                Loading account...
            </div>
        )
    }

    if (error || !account) {
        return (
            <div className="p-6">
                <div className="px-4 py-3 bg-red-900 border border-red-700 rounded text-sm text-red-300 mb-4">
                    {error ?? 'Account not found'}
                </div>
                <button
                    onClick={() => navigate('/accounts')}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Back to accounts
                </button>
            </div>
        )
    }

    const transactionColumns = [
        {
            key: 'postedAt',
            header: 'Date',
            render: (t: Transaction) =>
                new Date(t.postedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                }),
        },
        {
            key: 'description',
            header: 'Description',
            render: (t: Transaction) => (
                <span className="font-mono text-xs">{t.description}</span>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (t: Transaction) => (
                <span
                    className={`font-mono text-sm ${t.direction === 'credit' ? 'text-green-400' : 'text-red-400'}`}
                >
                    {t.direction === 'credit' ? '+' : '-'}$
                    {parseFloat(t.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (t: Transaction) => (
                <span className={`text-sm ${t.status === 'posted' ? 'text-gray-500' : 'text-yellow-400'}`}>
                    {t.status.toUpperCase()}
                </span>
            ),
        },
    ]

    return (
        <div className="p-6">
            {/* Back link */}
            <button
                onClick={() => navigate('/accounts')}
                className="text-sm text-blue-600 hover:underline mb-4 block"
            >
                ← Back to accounts
            </button>

            {/* Account header */}
            <div className="bg-gray-900 rounded border border-gray-700 p-5 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {account.customerName}
                        </h2>
                        <p className="font-mono text-sm text-gray-400 mt-0.5">
                            {account.accountNumber}
                        </p>
                    </div>
                    <span className={`text-sm ${STATUS_TEXT[account.status]}`}>
                        {account.status.toUpperCase()}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Balance
                        </p>
                        <p className="font-mono font-medium text-white mt-0.5">
                            ${parseFloat(account.balance).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Type
                        </p>
                        <p className="capitalize text-white mt-0.5">{account.type}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Opened
                        </p>
                        <p className="text-white mt-0.5">
                            {new Date(account.openedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-4">
                <nav className="flex gap-6">
                    {(['transactions', 'memos', 'audit log'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {TAB_LABELS[tab]}
                            {tab === 'memos' && memos.length > 0 && (
                                <span className="ml-1.5 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                                    {memos.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'transactions' && (
                <DataTable
                    columns={transactionColumns}
                    rows={transactions}
                    emptyMessage="No transactions found."
                />
            )}

            {activeTab === 'memos' && (
                <div>
                    {memos.length === 0 ? (
                        <p className="text-sm text-gray-400 py-6 text-center">
                            No memos on this account.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3 mb-6">
                            {memos.map(memo => (
                                <div
                                    key={memo.id}
                                    className="bg-gray-900 border border-gray-700 rounded p-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-white">
                                            {memo.authorName}
                                        </span>
                                        <span className="text-xs text-gray-400 capitalize">
                                            · {memo.authorRole}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-auto">
                                            {new Date(memo.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">{memo.body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add memo form — supervisors only */}
                    {isSupervisor && (
                        <div className="bg-gray-900 border border-gray-700 rounded p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">
                                Add memo
                            </h4>
                            <form onSubmit={handleAddMemo}>
                                <textarea
                                    value={memoBody}
                                    onChange={e => setMemoBody(e.target.value)}
                                    rows={3}
                                    placeholder="Add an internal note..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                                {memoError && (
                                    <p className="text-xs text-red-600 mt-1">{memoError}</p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={memoSubmitting || !memoBody.trim()}
                                        className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {memoSubmitting ? 'Saving...' : 'Save memo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'audit log' && (
                <ActivityFeed accountId={account.id} />
            )}
        </div>
    )
}

export default AccountDetail