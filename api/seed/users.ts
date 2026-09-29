import type { InferInsertModel } from 'drizzle-orm'
import type { users } from '../src/db/schema.js'

export type NewUser = InferInsertModel<typeof users>

export const seedUsers: Omit<NewUser, 'passwordHash'>[] = [
    {
        name: 'Alice Chen',
        email: 'alice.chen@ops.internal',
        role: 'analyst',
    },
    {
        name: 'Marcus Webb',
        email: 'marcus.webb@ops.internal',
        role: 'supervisor',
    },
    {
        name: 'Priya Nair',
        email: 'priya.nair@ops.internal',
        role: 'analyst',
    },
    {
        name: 'Jordan Ellis',
        email: 'jordan.ellis@ops.internal',
        role: 'supervisor',
    },
    {
        name: 'Sam Rivera',
        email: 'sam.rivera@ops.internal',
        role: 'analyst',
    },
    {
        name: 'Taylor Okon',
        email: 'taylor.okon@ops.internal',
        role: 'analyst',
    },
    {
        name: 'Dana Frost',
        email: 'dana.frost@ops.internal',
        role: 'supervisor',
    },
    {
        name: 'Chris Patel',
        email: 'chris.patel@ops.internal',
        role: 'analyst',
    },
    {
        name: 'Morgan Lee',
        email: 'morgan.lee@ops.internal',
        role: 'supervisor',
    },
    {
        name: 'Riley Shaw',
        email: 'riley.shaw@ops.internal',
        role: 'analyst',
    },
]