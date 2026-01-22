// views
import ForgotPasswordView from '@/views/auth/forgot-password-view'
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

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
