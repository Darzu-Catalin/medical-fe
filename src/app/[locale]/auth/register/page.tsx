// views
import { RegisterView } from '@/views/auth'
import { createMetaData } from '@/middleware';

// ----------------------------------------------------------------------
export async function generateMetadata({ params: { locale } }: {
  params: { locale: string }
}) {
  return createMetaData({
    locale,
    namespace: "Inregistrare",
  })
}

export default function RegisterPage() {
  return <RegisterView />
}


