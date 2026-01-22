import { useMemo } from 'react'
import { paths } from '@/routes/paths'
import { useAppSelector } from '@/redux/store'
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
  patients: icon('mdi:account-group'),
  reports: icon('mdi:chart-line'),
  settings: icon('mdi:cog'),
  profile: icon('mdi:account-circle'),
  records: icon('mdi:folder'),
  appointments: icon('mdi:calendar-clock'),
  documents: icon('mdi:file-document'),
  notifications: icon('mdi:bell'),
  ratings: icon('mdi:star'),
  schedule: icon('mdi:calendar-multiselect'),
}

// ----------------------------------------------------------------------

export function useNavData() {
  const userRole = useAppSelector((state) => state.auth.userRole)

  const data = useMemo(() => {
    const navigationItems = []

    if (userRole === 'admin') {
      // Admin sees everything
      navigationItems.push(
        {
          subheader: 'Administrative',
          items: [
            { title: 'Dashboard', path: paths.dashboard.admin, icon: ICONS.dashboard },
            { title: 'System Settings', path: '/dashboard/settings', icon: ICONS.settings },
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
        {
          subheader: 'Patient Management',
          items: [
            { title: 'Patients', path: paths.dashboard.client.list, icon: ICONS.patients },
            { title: 'Appointments', path: paths.dashboard.calendar.root, icon: ICONS.calendar },
            { title: 'Vaccines', path: paths.dashboard.vaccines.root, icon: ICONS.vaccines },
          ],
        }
      )
    } else if (userRole === 'doctor') {
      // Doctor sees medical-related items
      navigationItems.push(
        {
          subheader: 'Medical Practice',
          items: [
            { title: 'Dashboard', path: paths.dashboard.doctor, icon: ICONS.dashboard },
            { title: 'My Schedule', path: '/dashboard/schedule', icon: ICONS.schedule },
            { title: 'My Patients', path: paths.dashboard.client.list, icon: ICONS.patients },
            { title: 'Appointments', path: paths.dashboard.calendar.root, icon: ICONS.appointments },
            { title: 'Medical Records', path: '/dashboard/medical-records', icon: ICONS.records },
          ],
        },
        {
          subheader: 'Clinical Tools',
          items: [
            { title: 'Documents', path: '/dashboard/documents', icon: ICONS.documents },
            { title: 'Patient Ratings', path: '/dashboard/ratings', icon: ICONS.ratings },
            { title: 'Reports', path: '/dashboard/reports', icon: ICONS.reports },
          ],
        },
        {
          subheader: 'Communication',
          items: [
            { title: 'Notifications', path: '/dashboard/notifications', icon: ICONS.notifications },
          ],
        },
        {
          subheader: 'My Account',
          items: [
            { title: 'Profile', path: paths.dashboard.profile.root, icon: ICONS.profile },
          ],
        }
      )
    } else {
      // Patient sees limited items
      navigationItems.push(
        {
          subheader: 'My Health',
          items: [
            { title: 'Dashboard', path: paths.dashboard.patients, icon: ICONS.dashboard },
            { title: 'My Appointments', path: paths.dashboard.calendar.root, icon: ICONS.appointments },
            { title: 'My Vaccines', path: paths.dashboard.vaccines.root, icon: ICONS.vaccines },
          ],
        },
        {
          subheader: 'Health Records',
          items: [
            { title: 'Medical Records', path: '/dashboard/medical-records', icon: ICONS.records },
            { title: 'My Documents', path: '/dashboard/documents', icon: ICONS.documents },
          ],
        },
        {
          subheader: 'Communication',
          items: [
            { title: 'Rate Doctors', path: '/dashboard/ratings', icon: ICONS.ratings },
            { title: 'Notifications', path: '/dashboard/notifications', icon: ICONS.notifications },
          ],
        },
        {
          subheader: 'My Account',
          items: [
            { title: 'Profile', path: paths.dashboard.profile.root, icon: ICONS.profile },
          ],
        }
      )
    }

    return navigationItems
  }, [userRole])

  return data
}
