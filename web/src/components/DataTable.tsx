import React from 'react'

interface Column<T> {
    key: string
    header: string
    render: (row: T) => React.ReactNode
    className?: string
}

interface Props<T extends { id: string }> {
    columns: Column<T>[]
    rows: T[]
    onRowClick?: (row: T) => void
    emptyMessage?: string
    renderExpanded?: (row: T) => React.ReactNode
    expandedId?: string
}

const DataTable = <T extends { id: string }>({
    columns,
    rows,
    onRowClick,
    emptyMessage = 'No results found.',
    renderExpanded,
    expandedId,
}: Props<T>) => {
    return (
        <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-900">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${col.className ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-gray-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr
                                    onClick={() => onRowClick?.(row)}
                                    className={`${
                                        onRowClick
                                            ? 'cursor-pointer hover:bg-gray-700 transition-colors'
                                            : ''
                                    } ${expandedId === row.id ? 'bg-gray-700' : ''}`}
                                >
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 text-gray-300 ${col.className ?? ''}`}
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                                {renderExpanded && expandedId === row.id && (
                                    <tr>
                                        <td colSpan={columns.length} className="p-0">
                                            {renderExpanded(row)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable
