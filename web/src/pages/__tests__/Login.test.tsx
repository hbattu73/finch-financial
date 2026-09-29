import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'
import * as api from '../../api'

// Mock the API module
vi.mock('../../api')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mockOnLogin = vi.fn()

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <Login onLogin={mockOnLogin} />
            </BrowserRouter>
        )
    }

    it('renders login form with email and password fields', () => {
        renderLogin()

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation error when submitting empty form', async () => {
        renderLogin()

        const submitButton = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(submitButton)

        // HTML5 validation should prevent submission
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        expect(emailInput.validity.valid).toBe(false)
    })

    it('calls login API with credentials on form submit', async () => {
        const mockUser = {
            data: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'analyst' as const,
                createdAt: '2024-01-01T00:00:00Z',
            },
        }

        vi.mocked(api.login).mockResolvedValue(mockUser)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            })
        })
    })

    it('navigates to accounts page on successful login', async () => {
        const mockUser = {
            data: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'analyst' as const,
                createdAt: '2024-01-01T00:00:00Z',
            },
        }

        vi.mocked(api.login).mockResolvedValue(mockUser)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockOnLogin).toHaveBeenCalledWith(mockUser.data)
            expect(mockNavigate).toHaveBeenCalledWith('/accounts')
        })
    })

    it('displays error message on failed login', async () => {
        const mockError = new api.ApiError(
            'INVALID_CREDENTIALS',
            'Invalid email or password',
            401
        )

        vi.mocked(api.login).mockRejectedValue(mockError)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
        })
    })

    it('disables submit button while login is in progress', async () => {
        vi.mocked(api.login).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        )

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        // Button should be disabled during API call
        expect(submitButton).toBeDisabled()

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })
    })

    it('clears password field after failed login', async () => {
        const mockError = new api.ApiError(
            'INVALID_CREDENTIALS',
            'Invalid email or password',
            401
        )

        vi.mocked(api.login).mockRejectedValue(mockError)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
            expect(passwordInput.value).toBe('')
            expect(emailInput.value).toBe('test@example.com')
        })
    })
})
