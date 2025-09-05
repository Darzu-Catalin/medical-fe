import { getTranslations } from 'next-intl/server'
import createMiddleware from 'next-intl/middleware'

import { LOCALES, LOCAL_PREFIX, DEFAULT_LOCALE } from './config-global'

export default createMiddleware({
  // A list of all locales that are supported
  locales: LOCALES,
  localeDetection:false,
  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: LOCAL_PREFIX,
})

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