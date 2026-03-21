interface BikeListingFilterSidebarProps {
  activeFiltersCount: number
  children: React.ReactNode
  onClearFilters: () => void
}

export function BikeListingFilterSidebar({
  activeFiltersCount,
  children,
  onClearFilters,
}: BikeListingFilterSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Bộ lọc</h3>
          {activeFiltersCount > 0 && (
            <button
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClearFilters}
            >
              Xóa tất cả
            </button>
          )}
        </div>
        {children}
      </div>
    </aside>
  )
}
