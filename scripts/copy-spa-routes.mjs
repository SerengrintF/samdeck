/**
 * GitHub Pages serves unknown paths as HTTP 404 (even with 404.html).
 * Copy index.html into each SPA route so crawlers get 200.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const dist = 'dist'
const index = join(dist, 'index.html')

const routes = [
  '/guide',
  '/season-guide',
  '/meta',
  '/about',
  '/privacy',
  '/contact',
  '/pioneer',
  '/coexist',
  '/roster',
  '/mine',
  '/recommend',
  '/tier',
]

copyFileSync(index, join(dist, '404.html'))

for (const route of routes) {
  const dest = join(dist, route.slice(1), 'index.html')
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(index, dest)
  console.log(`copied ${dest}`)
}
