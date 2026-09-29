import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataTable from '../DataTable'

interface TestRow {
    id: string
    name: string
    value: number
}

describe('DataTable', () => {
    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (row: TestRow) => <span>{row.name}</span>,
        },
        {
            key: 'value',
            header: 'Value',
            render: (row: TestRow) => <span>{row.value}</span>,
        },
    ]

    const rows: TestRow[] = [
        { id: '1', name: 'Alice', value: 100 },
        { id: '2', name: 'Bob', value: 200 },
        { id: '3', name: 'Charlie', value: 300 },
    ]

    it('renders table headers correctly', () => {
        render(<DataTable columns={columns} rows={rows} />)

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Value')).toBeInTheDocument()
    })

    it('renders all rows', () => {
        render(<DataTable columns={columns} rows={rows} />)

        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(screen.getByText('Charlie')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
        expect(screen.getByText('300')).toBeInTheDocument()
    })

    it('renders empty state when no rows provided', () => {
        render(
            <DataTable
                columns={columns}
                rows={[]}
                emptyMessage="No data available"
            />
        )

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('uses default empty message when not provided', () => {
        render(<DataTable columns={columns} rows={[]} />)

        expect(screen.getByText('No results found.')).toBeInTheDocument()
    })

    it('calls onRowClick when a row is clicked', () => {
        const onRowClick = vi.fn()
        render(
            <DataTable columns={columns} rows={rows} onRowClick={onRowClick} />
        )
        fireEvent.click(screen.getByText('Alice'))
        expect(onRowClick).toHaveBeenCalledWith(rows[0])
    })

    it('renders expanded content for the matching expandedId', () => {
        const renderExpanded = (row: TestRow) => (
            <div>Expanded: {row.name}</div>
        )
        render(
            <DataTable
                columns={columns}
                rows={rows}
                renderExpanded={renderExpanded}
                expandedId="2"
            />
        )
        expect(screen.getByText('Expanded: Bob')).toBeInTheDocument()
        expect(screen.queryByText('Expanded: Alice')).not.toBeInTheDocument()
        expect(screen.queryByText('Expanded: Charlie')).not.toBeInTheDocument()
    })

    it('does not render expanded content when expandedId does not match', () => {
        const renderExpanded = (row: TestRow) => (
            <div>Expanded: {row.name}</div>
        )
        render(
            <DataTable
                columns={columns}
                rows={rows}
                renderExpanded={renderExpanded}
                expandedId="999"
            />
        )
        expect(screen.queryByText(/Expanded:/)).not.toBeInTheDocument()
    })
})
