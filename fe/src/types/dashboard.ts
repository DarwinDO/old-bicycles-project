export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalInspections: number
  passedInspections: number
  failedInspections: number
  monthlyRevenue: Record<string, number>
  monthlyOrders: Record<string, number>
}
