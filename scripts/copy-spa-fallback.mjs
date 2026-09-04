import { copyFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const indexPath = path.join(root, 'dist', 'index.html')
const fallbackPath = path.join(root, 'dist', '404.html')

if (!existsSync(indexPath)) {
  console.error('Missing dist/index.html — run vite build first.')
  process.exit(1)
}

copyFileSync(indexPath, fallbackPath)
console.log('Created dist/404.html for GitHub Pages SPA routing.')
