import { useMemo } from 'react'
import { paths } from '@/routes/paths'
import Iconify from '@/components/ui/minimals/iconify'

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify icon={`${name}`} sx={{ width: 24, height: 24 }} />

const ICONS = {
  dashboard: icon('ri:dashboard-2-fill'),
  calendar: icon('mdi:calendar'),
  clinics: icon('mdi:hospital-building'),
  doctors: icon('mdi:stethoscope'),
  contacts: icon('mdi:account-tie'),
  vaccines: icon('mdi:needle'),
  audit: icon('mdi:clipboard-text-clock'),
}

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      {
        subheader: 'General',
        items: [
          { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
          { title: 'Appointments', path: paths.dashboard.calendar.root, icon: ICONS.calendar },
          { title: 'Vaccines', path: paths.dashboard.vaccines.root, icon: ICONS.vaccines },
          { title: 'Activity Log', path: paths.dashboard.auditLog.root, icon: ICONS.audit },
        ],
      },
      {
        subheader: 'Medical Network',
        items: [
          { title: 'Clinics', path: paths.dashboard.workplace.list, icon: ICONS.clinics },
          { title: 'Doctors', path: paths.dashboard.provider.list, icon: ICONS.doctors },
          { title: 'Contact Persons', path: paths.dashboard['contact-person'].list, icon: ICONS.contacts },
        ],
      },
    ],
    []
  )

  return data
}
