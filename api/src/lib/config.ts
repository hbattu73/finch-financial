/**
 * Secret used to sign session JWTs.
 *
 * In development we fall back to a well-known value so the app runs with no
 * setup. In production there is no fallback — a real secret must be supplied,
 * because anyone who knows this value can forge a session for any user.
 */
export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET

    if (secret) return secret

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is not configured')
    }

    return 'workshop-dev-secret'
}
