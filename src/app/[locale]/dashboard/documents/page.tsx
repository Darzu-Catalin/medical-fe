import { RoleBasedGuard } from '@/auth/guard';
import { PERMISSIONS } from '@/utils/permissions.utils';
import DocumentsView from '@/views/dashboard/documents/documents-view';

export const metadata = {
  title: 'Documents',
  description: 'Manage medical documents',
}

export default function DocumentsPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.DOCUMENTS.VIEW, PERMISSIONS.ROLES.PATIENT, PERMISSIONS.ROLES.DOCTOR]} hasContent>
      <DocumentsView />
    </RoleBasedGuard>
  )
}