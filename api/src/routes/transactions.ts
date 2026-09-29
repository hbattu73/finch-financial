import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { currentUser } from '../middleware/currentUser.js'
import * as transactionsService from '../services/transactions.js'

export const transactionsRouter = Router()

// GET /api/transactions — global transactions list with filters
transactionsRouter.get(
    '/',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1
            const pageSize = Number(req.query.pageSize) || 25
            const q = req.query.q as string | undefined
            const direction = req.query.direction as 'credit' | 'debit' | undefined
            const status = req.query.status as 'posted' | 'pending' | undefined

            const result = await transactionsService.listAllTransactions(req.user!, {
                ...(q && { q }),
                ...(direction && { direction }),
                ...(status && { status }),
                page,
                pageSize,
            })

            res.json({
                data: result.rows,
                meta: {
                    total: result.total,
                    page,
                    pageSize,
                },
            })
        } catch (err) {
            next(err)
        }
    }
)
