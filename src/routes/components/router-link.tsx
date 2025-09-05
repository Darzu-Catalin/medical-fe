import { forwardRef } from 'react'
import { LinkProps } from 'next/link'
import { createSharedPathnamesNavigation } from 'next-intl/navigation'

import { LOCALES, LOCAL_PREFIX } from '../../config-global'

export const { Link } = createSharedPathnamesNavigation({
  locales: LOCALES,
  localePrefix: LOCAL_PREFIX,
})


// ----------------------------------------------------------------------

const RouterLink = forwardRef<HTMLAnchorElement, LinkProps>(({ ...other }, ref) => (
  // @ts-ignore
  <Link ref={ref} {...other} />
))

export default RouterLink
