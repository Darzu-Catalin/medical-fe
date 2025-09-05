import { createSharedPathnamesNavigation } from 'next-intl/navigation'

import { LOCALES, LOCAL_PREFIX } from '../../config-global'

export const { usePathname } = createSharedPathnamesNavigation({
  locales: LOCALES,
  localePrefix: LOCAL_PREFIX,
})
