import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-muted/30 leading-none select-none">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl">🚲💨</div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                    Oops! Trang không tồn tại
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Có vẻ như chiếc xe đạp bạn đang tìm đã đạp đi mất rồi.
                    Trang này không tồn tại hoặc đã bị xóa.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                        <Link to={ROUTES.HOME}>
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link to={ROUTES.MARKET}>
                            <Search className="mr-2 h-4 w-4" />
                            Tìm xe đạp
                        </Link>
                    </Button>
                </div>

                <button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Quay lại trang trước
                </button>
            </div>
        </div>
    )
}
