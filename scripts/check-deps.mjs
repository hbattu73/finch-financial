// Guards `npm run dev`: without an install, concurrently is missing and npm
// fails with a bare "concurrently: not found", which says nothing useful.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

if (!existsSync(path.join(root, 'node_modules', 'concurrently'))) {
    console.error('\nDependencies are not installed.\n\n  Run:  npm run setup\n')
    process.exit(1)
}
