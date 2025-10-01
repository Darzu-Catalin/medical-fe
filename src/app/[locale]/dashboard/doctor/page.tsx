import { RoleBasedGuard } from '@/auth/guard';
import { PERMISSIONS } from '@/utils/permissions.utils';
import DoctorDashboardView from 'src/views/dashboard/doctor/doctor-dashboard-view';

export default function DoctorDashboardPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.ROLES.DOCTOR]} hasContent>
      <DoctorDashboardView />
    </RoleBasedGuard>
  );
}