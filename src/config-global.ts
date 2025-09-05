import { paths } from 'src/routes/paths'

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API
export const MUI_KEY =
  '11324e493da2f4470771cb21fe3b8016Tz04MjM3OCxFPTE3MzcxMjEzNTYwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=';

// When you add a new locale, you must add it to LOCALES and also check middleware config
//  matcher: ['/', '/(en|ro)/:path*']
export const DEFAULT_LOCALE = 'ro'
export const LOCALES = ['en', 'ro']
export const LOCAL_PREFIX = 'as-needed'
// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root // as '/dashboard'

// TEMPORARY: Disable auth/guards globally. Set to false to re-enable.
export const DISABLE_AUTH = true

