import { AdminDashboard } from '@/components/features/admin/admin-dashboard'
import { mockAdminDashboard } from '@/lib/rappi'

export default function AdminPage() {
  return <AdminDashboard dashboard={mockAdminDashboard} />
}
