import { RoleBasedGuard } from '@/auth/guard';
import { PERMISSIONS } from '@/utils/permissions.utils';
import AdminDashboardView from 'src/views/dashboard/admin/admin-dashboard-view';

export default function AdminDashboardPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.ROLES.ADMIN]} hasContent>
      <AdminDashboardView />
    </RoleBasedGuard>
  );
}