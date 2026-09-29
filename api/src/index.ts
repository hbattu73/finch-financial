import { app } from './app.js'

const PORT = process.env.PORT ?? 3000

const server = app.listen(PORT)

// Log on 'listening', not app.listen's callback — Express fires that callback
// even when the bind fails, which would print a misleading success line.
server.on('listening', () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/health`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code !== 'EADDRINUSE') throw err
  console.error(`Port ${PORT} is in use. Free it, or set PORT in api/.env.`)
  process.exit(1)
})
