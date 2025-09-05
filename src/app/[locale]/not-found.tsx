import { NotFoundView } from '@/views/error'
import { createMetaData } from '@/middleware'

// ----------------------------------------------------------------------

export async function generateMetadata({ params: { locale } }: {
  params: { locale: string }
}) {
  return createMetaData({
    locale,
    namespace: "NotFoundPage"
  })
}

export default function NotFoundPage() {
  return <NotFoundView />
}
