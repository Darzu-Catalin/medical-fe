import { getTranslations } from 'next-intl/server'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { LOCALES, LOCAL_PREFIX, DEFAULT_LOCALE, ROLE_BASED_PATHS } from './config-global'

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: LOCALES,
  localeDetection: false,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: LOCAL_PREFIX,
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Let client-side components handle dashboard redirects
  
  // Apply internationalization middleware for all other routes
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|ro)/:path*',
  ],
}

export async function createMetaData(payload: { locale: string; namespace: string }) {
  const t = await getTranslations(payload)

  return {
    title: t('title'),
    description: t('description'),
  }
}