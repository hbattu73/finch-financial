import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { User } from '@shared/types'
import { getMe } from './api'
import Layout from './components/Layout'
import Login from './pages/Login'
import AccountsList from './pages/AccountsList'
import AccountDetail from './pages/AccountDetail'
import TransactionsList from './pages/TransactionsList'

const App = () => {
    const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined)

    useEffect(() => {
        getMe()
            .then(res => setCurrentUser(res.data))
            .catch(() => setCurrentUser(null))
    }, [])

    // undefined = still loading, null = not authenticated, User = authenticated
    if (currentUser === undefined) return null

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    currentUser
                        ? <Navigate to="/accounts" replace />
                        : <Login onLogin={setCurrentUser} />
                } />
                <Route path="/" element={
                    currentUser
                        ? <Layout currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
                        : <Navigate to="/login" replace />
                }>
                    <Route index element={<Navigate to="/accounts" replace />} />
                    <Route path="accounts" element={<AccountsList />} />
                    <Route path="accounts/:id" element={<AccountDetail />} />
                    <Route path="transactions" element={<TransactionsList />} />
                </Route>
                <Route path="*" element={<Navigate to="/accounts" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
