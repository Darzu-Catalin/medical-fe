import { RoleBasedGuard } from '@/auth/guard';
import { PERMISSIONS } from '@/utils/permissions.utils';
import NotificationsView from '@/views/dashboard/notifications/notifications-view';

export const metadata = {
  title: 'Notifications',
  description: 'View and manage notifications',
}

export default function NotificationsPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.NOTIFICATIONS.VIEW, PERMISSIONS.ROLES.PATIENT, PERMISSIONS.ROLES.DOCTOR, PERMISSIONS.ROLES.ADMIN]} hasContent>
      <NotificationsView />
    </RoleBasedGuard>
  )
}