import { useMemo } from 'react'
import { paths } from '@/routes/paths'
import Iconify from '@/components/ui/minimals/iconify'

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify icon={`${name}`} sx={{ width: 24, height: 24 }} />

const ICONS = {
  dashboard: icon('ri:dashboard-2-fill'),
  user: icon('fa-solid:users'),
  document: icon('basil:document-solid'),
  partner: icon('mdi:business'),
  workplace: icon('mdi:office-building'),
  calendar: icon('mdi:calendar'),
}

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      {
        subheader: 'General',
        items: [
          { title: 'dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
          {
            title: 'clienți', path: paths.dashboard.client.list, icon: ICONS.partner,
          },
          {
            title: 'furnizori', path: paths.dashboard.provider.list, icon: ICONS.partner,
          },
          {
            title: 'puncte de lucru', path: paths.dashboard.workplace.list, icon: ICONS.workplace,
          }
        ],
      },
      {
        subheader: 'altceva',
        items: [
          {
            title: 'calendar', path: paths.dashboard.calendar.root, icon: ICONS.calendar,
          },
        ],
      },
      // ----------------------------------------------------------------------
      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'admin management',
        items: [
          {
            title: 'utilizatori', path: paths.dashboard.user.list, icon: ICONS.user,
          },
        ],
      },
    ],
    []
  )

  return data
}
