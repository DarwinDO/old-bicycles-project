import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboardPage from './AdminDashboardPage';

const { getStatsMock } = vi.hoisted(() => ({
  getStatsMock: vi.fn(),
}));

vi.mock('@/api/dashboard.api', () => ({
  dashboardApi: {
    getStats: getStatsMock,
  },
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    getStatsMock.mockReset();
  });

  it('renders separated GMV and platform revenue metrics', async () => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;

    getStatsMock.mockResolvedValueOnce({
      totalUsers: 120,
      totalProducts: 45,
      totalOrders: 12,
      totalRevenue: 20_000_000,
      totalGmv: 20_000_000,
      pendingPlatformFee: 80_000,
      recognizedPlatformRevenue: 350_000,
      reversedPlatformFee: 50_000,
      totalInspections: 18,
      passedInspections: 15,
      failedInspections: 3,
      monthlyRevenue: {
        '2026-02': 1_000_000,
        [currentMonthKey]: 3_000_000,
      },
      monthlyGmv: {
        '2026-02': 1_000_000,
        [currentMonthKey]: 3_000_000,
      },
      monthlyRecognizedPlatformRevenue: {
        [currentMonthKey]: 150_000,
      },
      monthlyOrders: {
        '2026-02': 2,
        [currentMonthKey]: 4,
      },
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(getStatsMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Tổng GMV')).toBeInTheDocument();
    expect(screen.getByText('Doanh thu sàn đã ghi nhận')).toBeInTheDocument();
    expect(screen.getByText('GMV tháng này')).toBeInTheDocument();
    expect(screen.getByText('Doanh thu sàn tháng này')).toBeInTheDocument();
    expect(screen.getByText('20.0M đ')).toBeInTheDocument();
    expect(screen.getByText('350K đ')).toBeInTheDocument();
    expect(screen.getByText('3.0M đ')).toBeInTheDocument();
    expect(screen.getByText('150K đ')).toBeInTheDocument();
    expect(
      screen.getByText(/GMV là tổng giá trị xe của các giao dịch hoàn tất/i)
    ).toBeInTheDocument();
    expect(screen.queryByText('4.0M đ')).not.toBeInTheDocument();
  });
});
