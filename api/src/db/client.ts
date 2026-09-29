import { config } from 'dotenv'
config()

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

// SQLite lives in a single file (or ':memory:' for tests). No server, no container.
const url = process.env.DATABASE_URL ?? './finch.db'

const sqlite = new Database(url)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
