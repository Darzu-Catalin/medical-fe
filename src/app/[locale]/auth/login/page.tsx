// views
import { LoginView } from '@/views/auth'
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

export default function LoginPage() {
  return <LoginView />
}


