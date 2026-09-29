// Creates api/.env from .env.example on first setup, and leaves an existing one alone.
// Written in Node rather than shell so it works on macOS, Windows and Linux.
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'api', '.env')

if (!existsSync(target)) {
    copyFileSync(path.join(root, '.env.example'), target)
    console.log('created api/.env from .env.example')
}
