import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@shared/types'
import { login } from '../api'

interface Props {
    onLogin: (user: User) => void
}

const Login = ({ onLogin }: Props) => {
    const navigate = useNavigate()
    const [showCreds, setShowCreds] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const copyToClipboard = (value: string, key: string) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(key)
            setTimeout(() => setCopied(null), 1500)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await login({ email, password })
            onLogin(res.data)
            navigate('/accounts')
        } catch {
            setError('Invalid email or password')
            setPassword('') // Clear password on failed login for security
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-sidebar-bg flex items-center justify-center">
            <div className="bg-gray-800 border border-blue-500 rounded p-8 w-full max-w-sm shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <img src="/bird.svg" alt="Finch" className="w-5 h-5" />
                        <h1 className="text-xl font-semibold text-white">Finch Financial</h1>
                    </div>
                    <p className="text-sm text-gray-300">Internal Operations Console</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@ops.internal"
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 pr-9 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                                tabIndex={-1}
                            >
                                <img
                                    src={showPassword ? '/eye-off.svg' : '/eye.svg'}
                                    alt={showPassword ? 'Hide password' : 'Show password'}
                                    className="w-3.5 h-3.5"
                                />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowCreds(v => !v)}
                        className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <img
                            src="/chevron-right.svg"
                            alt=""
                            className={`w-3 h-3 transition-transform ${showCreds ? 'rotate-90' : ''}`}
                        />
                        Workshop Credentials
                    </button>
                    {showCreds && (
                        <div className="mt-2 space-y-1">
                            {[
                                { key: 'analyst', label: 'ANALYST', value: 'alice.chen@ops.internal' },
                                { key: 'supervisor', label: 'SUPERVISOR', value: 'marcus.webb@ops.internal' },
                                { key: 'password', label: 'PASSWORD', value: 'Password123!', display: '••••••••••••' },
                            ].map(({ key, label, value, display }) => (
                                <div key={key} className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-gray-300">
                                        <span className="text-gray-500">{label}:</span> {display ?? value}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(value, key)}
                                        className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
                                        title={`Copy ${label.toLowerCase()}`}
                                    >
                                        <img
                                            src={copied === key ? '/check.svg' : '/copy.svg'}
                                            alt="Copy"
                                            className="w-3 h-3"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Login