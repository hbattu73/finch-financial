import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { currentUser } from '../middleware/currentUser.js'
import * as accountsService from '../services/accounts.js'
import * as auditLogRepo from '../repositories/auditLog.js'
import type { AccountStatus } from '@shared/types'

export const accountsRouter = Router()

// GET /api/accounts
accountsRouter.get(
    '/',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!
            const page = Math.max(1, parseInt(req.query['page'] as string) || 1)
            const pageSize = Math.min(
                100,
                parseInt(req.query['pageSize'] as string) || 25
            )
            const status = req.query['status'] as AccountStatus | undefined
            const q = req.query['q'] as string | undefined

            const { rows, total } = await accountsService.listAccounts(user, {
                ...(status && { status }),
                ...(q && { q }),
                page,
                pageSize,
            })

            res.json({
                data: rows,
                meta: { total, page, pageSize },
            })
        } catch (err) {
            next(err)
        }
    }
)

// GET /api/accounts/:id
accountsRouter.get(
    '/:id',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const account = await accountsService.getAccount(
                req.user!,
                req.params['id'] as string
            )
            res.json({ data: account })
        } catch (err) {
            next(err)
        }
    }
)

// GET /api/accounts/:id/transactions
accountsRouter.get(
    '/:id/transactions',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Math.max(1, parseInt(req.query['page'] as string) || 1)
            const pageSize = Math.min(
                100,
                parseInt(req.query['pageSize'] as string) || 25
            )
            const { rows, total } = await accountsService.listTransactions(
                req.user!,
                req.params['id'] as string,
                { page, pageSize }
            )
            res.json({ data: rows, meta: { total, page, pageSize } })
        } catch (err) {
            next(err)
        }
    }
)

// GET /api/accounts/:id/memos
accountsRouter.get(
    '/:id/memos',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const memos = await accountsService.listMemos(
                req.user!,
                req.params['id'] as string
            )
            res.json({ data: memos })
        } catch (err) {
            next(err)
        }
    }
)

// POST /api/accounts/:id/memos
accountsRouter.post(
    '/:id/memos',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req.body as { body?: string }
            if (!body) {
                res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    message: 'body is required'
                })
                return
            }
            const memo = await accountsService.addMemo(
                req.user!,
                req.params['id'] as string,
                body
            )
            res.status(201).json({ data: memo })
        } catch (err) {
            next(err)
        }
    }
)

// GET /api/accounts/:id/audit-log
accountsRouter.get(
    '/:id/audit-log',
    currentUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params['id'] as string
            const page = Math.max(1, parseInt(req.query['page'] as string) || 1)
            const pageSize = Math.min(
                100,
                parseInt(req.query['pageSize'] as string) || 25
            )

            // verify account exists and user has access
            await accountsService.getAccount(req.user!, id)

            const { rows, total } = await auditLogRepo.findAuditEntriesByAccount({
                accountId: id,
                page,
                pageSize,
            })

            res.json({ data: rows, meta: { total, page, pageSize } })
        } catch (err) {
            next(err)
        }
    }
)