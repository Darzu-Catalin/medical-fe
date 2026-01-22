// views
import ChangePasswordMandatoryView from '@/views/auth/change-password-mandatory-view'
import { createMetaData } from '@/middleware';

// ----------------------------------------------------------------------
export async function generateMetadata({ params: { locale } }: {
  params: { locale: string }
}) {
  return createMetaData({
    locale,
    namespace: "AuthPage"
  })
}

export default function ChangePasswordMandatoryPage() {
  return <ChangePasswordMandatoryView />
}
