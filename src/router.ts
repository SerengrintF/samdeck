/** Path-based routes for crawlable AdSense content URLs. */

export type AppView = 'browse' | 'set-result'
export type AppPage = 'recommend' | 'roster' | 'mine'
export type InfoPageId = 'guide' | 'meta' | 'about' | 'privacy' | 'contact'
export type NavPage = AppPage | InfoPageId
export type RecommendTab = 'tier' | 'coexist' | 'pioneer'

export type RouteSnapshot = {
  view: AppView
  page: NavPage
  recommendTab: RecommendTab
}

export const SITE_ORIGIN = 'https://samdeck.xyz'

/** Clean pathnames without trailing slash (except home `/`). */
export function normalizePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || ''
  let path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

export function pathFromRoute(route: RouteSnapshot): string {
  if (route.view === 'set-result') return '/roster/result'

  switch (route.page) {
    case 'guide':
      return '/guide'
    case 'meta':
      return '/season-guide'
    case 'about':
      return '/about'
    case 'privacy':
      return '/privacy'
    case 'contact':
      return '/contact'
    case 'roster':
      return '/roster'
    case 'mine':
      return '/mine'
    case 'recommend':
    default:
      if (route.recommendTab === 'coexist') return '/coexist'
      if (route.recommendTab === 'pioneer') return '/pioneer'
      return '/'
  }
}

/** Footer / inline links — browse view paths only */
export function hrefForPage(page: NavPage): string {
  return pathFromRoute({ view: 'browse', page, recommendTab: 'tier' })
}

export function hrefForRecommendTab(tab: RecommendTab): string {
  return pathFromRoute({ view: 'browse', page: 'recommend', recommendTab: tab })
}

export function routeFromPath(pathname: string): RouteSnapshot {
  const path = normalizePath(pathname)

  switch (path) {
    case '/guide':
      return { view: 'browse', page: 'guide', recommendTab: 'tier' }
    case '/season-guide':
    case '/meta':
      return { view: 'browse', page: 'meta', recommendTab: 'tier' }
    case '/about':
      return { view: 'browse', page: 'about', recommendTab: 'tier' }
    case '/privacy':
      return { view: 'browse', page: 'privacy', recommendTab: 'tier' }
    case '/contact':
      return { view: 'browse', page: 'contact', recommendTab: 'tier' }
    case '/roster':
      return { view: 'browse', page: 'roster', recommendTab: 'tier' }
    case '/roster/result':
      return { view: 'set-result', page: 'roster', recommendTab: 'tier' }
    case '/mine':
      return { view: 'browse', page: 'mine', recommendTab: 'tier' }
    case '/coexist':
      return { view: 'browse', page: 'recommend', recommendTab: 'coexist' }
    case '/pioneer':
      return { view: 'browse', page: 'recommend', recommendTab: 'pioneer' }
    case '/':
    case '/recommend':
    case '/tier':
    default:
      return { view: 'browse', page: 'recommend', recommendTab: 'tier' }
  }
}

export function absoluteUrl(path: string): string {
  const p = path === '/' ? '/' : path
  return `${SITE_ORIGIN}${p}`
}

export function writeHistory(path: string, mode: 'push' | 'replace'): void {
  const url = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path === '/' ? '/' : path}`
  if (mode === 'replace') history.replaceState(null, '', url)
  else history.pushState(null, '', url)
}
