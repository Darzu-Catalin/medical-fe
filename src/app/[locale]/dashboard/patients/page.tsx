import { RoleBasedGuard } from '@/auth/guard';
import { PERMISSIONS } from '@/utils/permissions.utils';
import PatientsDashboardView from 'src/views/dashboard/patients/patients-dashboard-view';

export default function PatientsDashboardPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.ROLES.PATIENT]} hasContent>
      <PatientsDashboardView />
    </RoleBasedGuard>
  );
}