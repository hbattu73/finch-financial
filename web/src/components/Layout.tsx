import { Outlet, NavLink } from 'react-router-dom'
import type { User } from '@shared/types'
import { logout } from '../api'

interface Props {
    currentUser: User
    onLogout: () => void
}

const Layout = ({ currentUser, onLogout }: Props) => {
    const handleLogout = async () => {
        await logout()
        onLogout()
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar-bg text-white flex flex-col shrink-0">
                {/* App name */}
                <div className="px-6 py-5 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <img src="/bird.svg" alt="Finch" className="w-5 h-5" />
                        <h1 className="text-lg font-semibold tracking-tight">
                            Finch Financial
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-7">
                        Internal Operations Console
                    </p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavLink
                        to="/accounts"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${isActive
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`
                        }
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="5" rx="2"/>
                            <line x1="2" x2="22" y1="10" y2="10"/>
                        </svg>
                        Accounts
                    </NavLink>
                    <NavLink
                        to="/transactions"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${isActive
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`
                        }
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
                            <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
                            <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
                        </svg>
                        Transactions
                    </NavLink>
                </nav>

                {/* Current user + logout */}
                <div className="px-4 py-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="relative shrink-0 ml-3">
                            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-semibold">
                                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap ${
                                currentUser.role === 'supervisor'
                                    ? 'bg-yellow-500 text-yellow-950'
                                    : 'bg-blue-400 text-blue-950'
                            }`}>
                                {currentUser.role.toUpperCase()}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4 bg-sidebar-bg">
                <div className="bg-gray-800 rounded-lg border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
