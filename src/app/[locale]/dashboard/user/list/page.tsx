import UserListView from '@/views/dashboard/user/list/list-view'

export const metadata = {
  title: 'Lista Utilizatori',
  description: 'Listarea, filtrarea si sortarea utilizatorilor',
}

export default function Page() {
  return <UserListView />
}
