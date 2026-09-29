import type { InferInsertModel } from 'drizzle-orm'
import type { accounts } from '../src/db/schema.js'

export type NewAccount = InferInsertModel<typeof accounts>

export const seedAccounts: NewAccount[] = [
    {
        customerName: 'Acme Logistics LLC',
        accountNumber: '****-****-****-4471',
        type: 'checking',
        balance: '142850.00',
        status: 'active',
        openedAt: new Date('2021-03-15'),
    },
    {
        customerName: 'Elena Vasquez',
        accountNumber: '****-****-****-8823',
        type: 'savings',
        balance: '28400.50',
        status: 'active',
        openedAt: new Date('2022-07-01'),
    },
    {
        customerName: 'Big Bread Bakery',
        accountNumber: '****-****-****-2290',
        type: 'checking',
        balance: '9310.75',
        status: 'frozen',
        openedAt: new Date('2020-11-20'),
    },
    {
        customerName: 'Omar Shaikh',
        accountNumber: '****-****-****-6614',
        type: 'checking',
        balance: '55000.00',
        status: 'active',
        openedAt: new Date('2023-01-10'),
    },
    {
        customerName: 'Northgate Properties',
        accountNumber: '****-****-****-3357',
        type: 'checking',
        balance: '310200.00',
        status: 'active',
        openedAt: new Date('2019-06-30'),
    },
    {
        customerName: 'Lena Park',
        accountNumber: '****-****-****-7782',
        type: 'savings',
        balance: '12075.25',
        status: 'active',
        openedAt: new Date('2023-09-14'),
    },
    {
        customerName: 'Riverside Auto Group',
        accountNumber: '****-****-****-1193',
        type: 'checking',
        balance: '0.00',
        status: 'closed',
        openedAt: new Date('2018-04-05'),
    },
    {
        customerName: 'Fatima Al-Amin',
        accountNumber: '****-****-****-5541',
        type: 'savings',
        balance: '67300.00',
        status: 'active',
        openedAt: new Date('2021-12-01'),
    },
    {
        customerName: 'Tran Consulting Group',
        accountNumber: '****-****-****-9908',
        type: 'checking',
        balance: '88150.30',
        status: 'frozen',
        openedAt: new Date('2022-02-28'),
    },
    {
        customerName: 'Daniel Okafor',
        accountNumber: '****-****-****-4429',
        type: 'checking',
        balance: '3240.10',
        status: 'active',
        openedAt: new Date('2024-01-17'),
    },
]