import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AdminCategoriesPage from './AdminCategoriesPage'

const {
  getCategoriesMock,
  getBrandsMock,
  getBrakeTypesMock,
  getFrameMaterialsMock,
  getGroupsetsMock,
} = vi.hoisted(() => ({
  getCategoriesMock: vi.fn(),
  getBrandsMock: vi.fn(),
  getBrakeTypesMock: vi.fn(),
  getFrameMaterialsMock: vi.fn(),
  getGroupsetsMock: vi.fn(),
}))

vi.mock('@/api/reference-data.api', () => ({
  referenceDataApi: {
    getCategories: getCategoriesMock,
    getBrands: getBrandsMock,
    getBrakeTypes: getBrakeTypesMock,
    getFrameMaterials: getFrameMaterialsMock,
    getGroupsets: getGroupsetsMock,
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
  },
}))

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    getCategoriesMock.mockReset()
    getBrandsMock.mockReset()
    getBrakeTypesMock.mockReset()
    getFrameMaterialsMock.mockReset()
    getGroupsetsMock.mockReset()

    getCategoriesMock.mockResolvedValue([])
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
})
