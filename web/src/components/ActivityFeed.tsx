import { useState, useEffect } from 'react'
import type { AuditEntry } from '@shared/types'
import { getAuditLog } from '../api'
import { getAuditLabel } from '../lib/auditLabels'

interface Props {
  accountId: string
}

const ActivityFeed = ({ accountId }: Props) => {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 25

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAuditLog(accountId, { page, pageSize })
      .then(res => {
        setEntries(res.data)
        setTotal(res.meta.total)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load activity')
      })
      .finally(() => setLoading(false))
  }, [accountId, page])

  if (loading) {
    return <div className="py-8 text-center text-gray-400 text-sm">Loading activity...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-400 text-sm">{error}</div>
  }

  if (entries.length === 0) {
    return <div className="py-8 text-center text-gray-400 text-sm">No activity recorded yet.</div>
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="flex flex-col divide-y divide-gray-700">
        {entries.map(entry => (
          <div key={entry.id} className="py-3 flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{entry.actorName}</span>
                <span className="text-xs text-gray-400 capitalize">· {entry.actorRole}</span>
              </div>
              <p className="text-sm text-gray-300 mt-0.5">{getAuditLabel(entry.action)}</p>
              {entry.payload['body'] && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  "{String(entry.payload['body'])}"
                </p>
              )}
              {entry.payload['reason'] && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Reason: {String(entry.payload['reason'])}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
