import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TransactionWithAccount, TransactionDirection, TransactionStatus } from '@shared/types'
import { getAllTransactions } from '../api'
import DataTable from '../components/DataTable'

const TransactionsList = () => {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<TransactionWithAccount[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [q, setQ] = useState('')
    const [search, setSearch] = useState('')
    const [direction, setDirection] = useState<TransactionDirection | ''>('')
    const [status, setStatus] = useState<TransactionStatus | ''>('')
    const [expandedId, setExpandedId] = useState<string | undefined>()

    const PAGE_SIZE = 25

    useEffect(() => {
        setLoading(true)
        setError(null)
        getAllTransactions({
            page,
            pageSize: PAGE_SIZE,
            ...(search && { q: search }),
            ...(direction && { direction }),
            ...(status && { status }),
        })
            .then(res => {
                setTransactions(res.data)
                setTotal(res.meta.total)
            })
            .catch(err => {
                setError(err instanceof Error ? err.message : 'Failed to load transactions')
            })
            .finally(() => setLoading(false))
    }, [page, search, direction, status])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(q)
        setPage(1)
    }

    const handleRowClick = (transaction: TransactionWithAccount) => {
        setExpandedId(expandedId === transaction.id ? undefined : transaction.id)
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        })

    const formatFullTimestamp = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        })

    const formatAmount = (amount: string, dir: TransactionDirection) => {
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
        return <span className={`font-medium ${dir === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{formatted}</span>
    }

    const truncateDescription = (desc: string, maxLength = 40) =>
        desc.length > maxLength ? `${desc.slice(0, maxLength)}...` : desc

    const totalPages = Math.ceil(total / PAGE_SIZE)

    const columns = [
        {
            key: 'date',
            header: 'Date',
            render: (t: TransactionWithAccount) => formatDate(t.postedAt),
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (t: TransactionWithAccount) => (
                <span className="font-medium text-white">{t.customerName}</span>
            ),
        },
        {
            key: 'account',
            header: 'Account Number',
            render: (t: TransactionWithAccount) => (
                <span className="font-mono text-gray-300">{t.accountNumber}</span>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (t: TransactionWithAccount) => (
                <span className="font-mono text-xs text-gray-300">
                    {truncateDescription(t.description)}
                </span>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (t: TransactionWithAccount) => formatAmount(t.amount, t.direction),
        },
        {
            key: 'direction',
            header: 'Direction',
            render: (t: TransactionWithAccount) => (
                <span className="text-sm text-gray-300">
                    {t.direction === 'credit' ? 'CREDIT' : 'DEBIT'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (t: TransactionWithAccount) => (
                <span className={`text-sm ${t.status === 'posted' ? 'text-gray-500' : 'text-yellow-400'}`}>
                    {t.status.toUpperCase()}
                </span>
            ),
        },
    ]

    const renderExpanded = (transaction: TransactionWithAccount) => (
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-700 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Full description</p>
                    <p className="font-mono text-gray-300 mt-0.5">{transaction.description}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Transaction ID</p>
                    <p className="font-mono text-gray-400 mt-0.5 text-xs">{transaction.id}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Account</p>
                    <p className="text-gray-300 mt-0.5">{transaction.customerName}</p>
                    <p className="font-mono text-gray-400 text-xs">{transaction.accountNumber}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Posted</p>
                    <p className="text-gray-300 mt-0.5">{formatFullTimestamp(transaction.postedAt)}</p>
                </div>
            </div>
            <div className="mt-3">
                <button
                    onClick={() => navigate(`/accounts/${transaction.accountId}`)}
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                    View account →
                </button>
            </div>
        </div>
    )

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Transactions</h2>
                <p className="text-sm text-gray-300 mt-1">
                    <span className="text-white">{total}</span> transaction{total !== 1 ? 's' : ''} found across all accounts
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap items-end">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search by customer..."
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setQ(''); setSearch(''); setPage(1) }}
                            className="text-sm text-gray-300 hover:text-white px-2 cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </form>

                <div>
                    <label htmlFor="direction-filter" className="block text-xs font-medium text-gray-300 mb-1">Direction</label>
                    <select
                        id="direction-filter"
                        value={direction}
                        onChange={e => { setDirection(e.target.value as TransactionDirection | ''); setPage(1) }}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="status-filter" className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                    <select
                        id="status-filter"
                        value={status}
                        onChange={e => { setStatus(e.target.value as TransactionStatus | ''); setPage(1) }}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        <option value="posted">Posted</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-900 border border-red-700 rounded text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Loading transactions...</div>
            ) : (
                <DataTable
                    columns={columns}
                    rows={transactions}
                    onRowClick={handleRowClick}
                    emptyMessage="No transactions match your filters."
                    renderExpanded={renderExpanded}
                    expandedId={expandedId}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransactionsList
