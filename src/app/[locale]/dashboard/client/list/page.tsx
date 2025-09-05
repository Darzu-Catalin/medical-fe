import ClientListView from "@/views/dashboard/client/list/list-view"

export const metadata = {
  title: 'Lista clienți',
  description: 'Listare clienților din sistem',
}

export default function Page() {
  return <ClientListView />
}
