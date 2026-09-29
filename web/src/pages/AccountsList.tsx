import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Account, AccountStatus } from '@shared/types'
import { getAccounts } from '../api'
import DataTable from '../components/DataTable'

const STATUS_OPTIONS: { label: string; value: AccountStatus | '' }[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Frozen', value: 'frozen' },
    { label: 'Closed', value: 'closed' },
]

const STATUS_TEXT: Record<AccountStatus, string> = {
    active: 'text-green-400',
    frozen: 'text-red-400',
    closed: 'text-gray-500',
}

const AccountsList = () => {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState<AccountStatus | ''>('')
    const [q, setQ] = useState('')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const PAGE_SIZE = 25

    useEffect(() => {
        setLoading(true)
        setError(null)
        getAccounts({
            page,
            pageSize: PAGE_SIZE,
            ...(status && { status }),
            ...(search && { q: search }),
        })
            .then(res => {
                setAccounts(res.data)
                setTotal(res.meta.total)
            })
            .catch(err => {
                setError(err instanceof Error ? err.message : 'Failed to load accounts')
            })
            .finally(() => setLoading(false))
    }, [page, status, search])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(q)
        setPage(1)
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    const columns = [
        {
            key: 'customerName',
            header: 'Customer',
            render: (a: Account) => (
                <span className="font-medium text-white">{a.customerName}</span>
            ),
        },
        {
            key: 'accountNumber',
            header: 'Account Number',
            render: (a: Account) => (
                <span className="font-mono text-gray-300">{a.accountNumber}</span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (a: Account) => (
                <span className="capitalize text-gray-300">{a.type}</span>
            ),
        },
        {
            key: 'balance',
            header: 'Balance',
            render: (a: Account) => (
                <span className="font-mono text-gray-300">
                    ${parseFloat(a.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a: Account) => (
                <span className={`text-sm capitalize ${STATUS_TEXT[a.status]}`}>
                    {a.status.toUpperCase()}
                </span>
            ),
        },
        {
            key: 'openedAt',
            header: 'Opened',
            render: (a: Account) =>
                new Date(a.openedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
        },
    ]

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Accounts</h2>
                <p className="text-sm text-gray-300 mt-1">
                    <span className="text-white">{total}</span> account{total !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap items-end">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search by name..."
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
                    <label htmlFor="status-filter" className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                    <select
                        id="status-filter"
                        value={status}
                        onChange={e => {
                            setStatus(e.target.value as AccountStatus | '')
                            setPage(1)
                        }}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
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
                <div className="py-12 text-center text-gray-400 text-sm">
                    Loading accounts...
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    rows={accounts}
                    onRowClick={a => navigate(`/accounts/${a.id}`)}
                    emptyMessage="No accounts match your filters."
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                    <span>
                        Page {page} of {totalPages}
                    </span>
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

export default AccountsList
