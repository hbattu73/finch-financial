import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../errorHandler.js'
import { AppError } from '../../lib/errors.js'

describe('errorHandler middleware', () => {
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>
    let mockNext: NextFunction
    let jsonMock: ReturnType<typeof vi.fn>
    let statusMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        mockReq = {}
        jsonMock = vi.fn()
        statusMock = vi.fn().mockReturnValue({ json: jsonMock })
        mockRes = { status: statusMock, json: jsonMock }
        mockNext = vi.fn()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('returns correct status and format for AppError', () => {
        errorHandler(new AppError('NOT_FOUND', 'Resource not found', 404), mockReq as Request, mockRes as Response, mockNext)

        expect(statusMock).toHaveBeenCalledWith(404)
        expect(jsonMock).toHaveBeenCalledWith({
            error: { code: 'NOT_FOUND', message: 'Resource not found' },
        })
    })

    it('returns 500 for unexpected errors and logs them', () => {
        const error = new Error('Something went wrong')
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext)

        expect(statusMock).toHaveBeenCalledWith(500)
        expect(jsonMock).toHaveBeenCalledWith({
            error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        })
        expect(console.error).toHaveBeenCalledWith('Unhandled error:', error)
    })

    it('does not log AppErrors', () => {
        errorHandler(new AppError('FORBIDDEN', 'Access denied', 403), mockReq as Request, mockRes as Response, mockNext)

        expect(console.error).not.toHaveBeenCalled()
    })
})
