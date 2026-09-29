import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as api from '../api'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client', () => {
    beforeEach(() => vi.clearAllMocks())
    afterEach(() => vi.restoreAllMocks())

    it('throws ApiError with correct properties', () => {
        const error = new api.ApiError('TEST_ERROR', 'Test message', 400)

        expect(error.name).toBe('ApiError')
        expect(error.code).toBe('TEST_ERROR')
        expect(error.message).toBe('Test message')
        expect(error.status).toBe(400)
    })

    it('login returns user data on success', async () => {
        const mockResponse = { data: { id: '1', name: 'Test User', email: 'test@example.com', role: 'analyst' } }
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse })

        const result = await api.login({ email: 'test@example.com', password: 'password123' })

        expect(result).toEqual(mockResponse)
    })

    it('login throws ApiError on failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }),
        })

        await expect(
            api.login({ email: 'wrong@example.com', password: 'wrong' })
        ).rejects.toThrow(api.ApiError)
    })

    it('logout throws ApiError on failure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

        await expect(api.logout()).rejects.toThrow(api.ApiError)
    })
})
