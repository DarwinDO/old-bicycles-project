import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AdminCategoriesPage from './AdminCategoriesPage'

const {
  getCategoriesMock,
  getBrandsMock,
  getBrakeTypesMock,
  getFrameMaterialsMock,
  getGroupsetsMock,
  getAdminSizeChartsMock,
} = vi.hoisted(() => ({
  getCategoriesMock: vi.fn(),
  getBrandsMock: vi.fn(),
  getBrakeTypesMock: vi.fn(),
  getFrameMaterialsMock: vi.fn(),
  getGroupsetsMock: vi.fn(),
  getAdminSizeChartsMock: vi.fn(),
}))

vi.mock('@/api/reference-data.api', () => ({
  referenceDataApi: {
    getCategories: getCategoriesMock,
    getBrands: getBrandsMock,
    getBrakeTypes: getBrakeTypesMock,
    getFrameMaterials: getFrameMaterialsMock,
    getGroupsets: getGroupsetsMock,
    getAdminSizeCharts: getAdminSizeChartsMock,
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
    createBrakeType: vi.fn(),
    updateBrakeType: vi.fn(),
    deleteBrakeType: vi.fn(),
    createFrameMaterial: vi.fn(),
    updateFrameMaterial: vi.fn(),
    deleteFrameMaterial: vi.fn(),
    createGroupset: vi.fn(),
    updateGroupset: vi.fn(),
    deleteGroupset: vi.fn(),
    createSizeChart: vi.fn(),
    updateSizeChart: vi.fn(),
    deleteSizeChart: vi.fn(),
  },
}))

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    getCategoriesMock.mockReset()
    getBrandsMock.mockReset()
    getBrakeTypesMock.mockReset()
    getFrameMaterialsMock.mockReset()
    getGroupsetsMock.mockReset()
    getAdminSizeChartsMock.mockReset()

    getCategoriesMock.mockResolvedValue([
      {
        id: 'category-road',
        name: 'Road Bike',
        slug: 'road-bike',
        createdAt: '2026-03-23T00:00:00Z',
      },
    ])
    getBrandsMock.mockResolvedValue([])
    getBrakeTypesMock.mockResolvedValue([])
    getFrameMaterialsMock.mockResolvedValue([])
    getGroupsetsMock.mockResolvedValue([
      {
        id: 'groupset-1',
        name: 'Shimano 105',
        description: '11-speed road groupset',
        createdAt: '2026-03-23T00:00:00Z',
      },
    ])
    getAdminSizeChartsMock.mockResolvedValue([
      {
        id: 'size-chart-1',
        categoryId: 'category-road',
        categoryName: 'Road Bike',
        name: 'Road bike size guide',
        description: 'Height guidance for road bikes',
        createdAt: '2026-03-23T00:00:00Z',
        updatedAt: '2026-03-23T00:00:00Z',
        rows: [
          {
            id: 'row-1',
            frameSize: '54',
            heightMinCm: 170,
            heightMaxCm: 178,
            note: 'Road fit',
            displayOrder: 0,
          },
        ],
      },
    ])
  })

  it('loads groupsets when the groupset tab is selected', async () => {
    render(<AdminCategoriesPage />)

    expect(getCategoriesMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /groupset/i }))

    await waitFor(() => {
      expect(getGroupsetsMock).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Shimano 105')).toBeInTheDocument()
    expect(screen.getByText('11-speed road groupset')).toBeInTheDocument()
  })

  it('loads size charts when the size chart tab is selected', async () => {
    render(<AdminCategoriesPage />)

    fireEvent.click(screen.getByRole('button', { name: /size chart/i }))

    await waitFor(() => {
      expect(getAdminSizeChartsMock).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Road bike size guide')).toBeInTheDocument()
    expect(screen.getByText('170 - 178 cm')).toBeInTheDocument()
  })
})
