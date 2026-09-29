import express from 'express'
import cors from 'cors'
import { eq } from 'drizzle-orm'
import { currentUser } from './middleware/currentUser.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { accountsRouter } from './routes/accounts.js'
import { transactionsRouter } from './routes/transactions.js'
import { errorHandler } from './middleware/errorHandler.js'
import { db } from './db/client.js'
import { users } from './db/schema.js'
import { sanitizeUser } from './lib/sanitize.js'
import { Errors } from './lib/errors.js'

export const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/me', currentUser, async (req, res, next) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1)

    if (!result[0]) {
      next(Errors.unauthorized())
      return
    }

    res.json({ data: sanitizeUser(result[0]) })
  } catch (err) {
    next(err)
  }
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/transactions', transactionsRouter)

app.use(errorHandler)
