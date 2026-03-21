interface BikeListingHeaderProps {
  isLoading: boolean
  totalElements: number
}

export function BikeListingHeader({ isLoading, totalElements }: BikeListingHeaderProps) {
  return (
    <div className="border-b bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tất cả xe đạp</h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? (
            'Đang tải...'
          ) : (
            <>
              Tìm thấy <span className="font-medium text-foreground">{totalElements}</span> xe đạp công khai
            </>
          )}
        </p>
      </div>
    </div>
  )
}
