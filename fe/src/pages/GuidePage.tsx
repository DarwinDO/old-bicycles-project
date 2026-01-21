import { Link } from 'react-router-dom'
import { BookOpen, Shield, Search, MessageCircle, CreditCard, CheckCircle, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

const guides = [
    {
        icon: Search,
        title: 'Hướng dẫn mua xe',
        description: 'Các bước tìm và mua xe đạp phù hợp',
        items: [
            'Tìm kiếm xe theo nhu cầu sử dụng',
            'Kiểm tra thông tin xe và người bán',
            'Liên hệ và xem xe trực tiếp',
            'Thương lượng giá và hoàn tất giao dịch',
        ]
    },
    {
        icon: BookOpen,
        title: 'Hướng dẫn bán xe',
        description: 'Các bước đăng tin và bán xe hiệu quả',
        items: [
            'Chuẩn bị hình ảnh chất lượng cao',
            'Điền đầy đủ thông tin xe',
            'Định giá hợp lý theo thị trường',
            'Phản hồi nhanh các tin nhắn',
        ]
    },
    {
        icon: Shield,
        title: 'Kiểm định xe đạp',
        description: 'Dịch vụ kiểm định đảm bảo chất lượng',
        items: [
            'Kiểm tra khung xe (đâm đổ, nứt gãy)',
            'Kiểm tra bộ truyền động',
            'Xác minh số serial',
            'Đánh giá tổng thể và báo cáo',
        ]
    },
]

const safetyTips = [
    { icon: CheckCircle, text: 'Luôn gặp mặt trực tiếp tại nơi công cộng' },
    { icon: CheckCircle, text: 'Kiểm tra xe kỹ trước khi thanh toán' },
    { icon: CheckCircle, text: 'Xác minh thông tin người bán' },
    { icon: AlertTriangle, text: 'Không chuyển tiền trước khi xem xe' },
    { icon: AlertTriangle, text: 'Cảnh giác với giá quá rẻ' },
]

const faqs = [
    {
        q: 'Làm thế nào để biết xe đạp có bị đâm đổ không?',
        a: 'Kiểm tra kỹ các mối hàn, vết nứt trên khung. Sử dụng dịch vụ kiểm định của chúng tôi để có kết quả chính xác nhất.'
    },
    {
        q: 'Phí kiểm định xe là bao nhiêu?',
        a: 'Phí kiểm định từ 200.000đ - 500.000đ tùy loại xe và mức độ chi tiết. Liên hệ đối tác kiểm định để biết thêm chi tiết.'
    },
    {
        q: 'Tôi có thể hủy giao dịch không?',
        a: 'Bạn có thể hủy giao dịch trước khi hoàn tất thanh toán. Sau khi thanh toán, việc hủy sẽ theo chính sách của từng trường hợp.'
    },
    {
        q: 'Làm sao để liên hệ hỗ trợ?',
        a: 'Liên hệ qua hotline 1900 1234 hoặc email support@bikeexchange.vn. Chúng tôi hỗ trợ 8:00 - 22:00 hàng ngày.'
    },
]

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/90 to-primary py-16">
                <div className="container mx-auto px-4 text-center">
                    <HelpCircle className="h-12 w-12 text-white mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white md:text-4xl">Trung tâm hướng dẫn</h1>
                    <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
                        Tất cả những gì bạn cần biết để mua bán xe đạp an toàn và hiệu quả trên BikeExchange
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Main Guides */}
                <div className="grid gap-6 md:grid-cols-3 mb-16">
                    {guides.map((guide) => (
                        <Card key={guide.title} className="h-full">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <guide.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{guide.title}</CardTitle>
                                <CardDescription>{guide.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {guide.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Process Steps */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-8">Quy trình giao dịch</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            { icon: Search, title: 'Tìm xe', desc: 'Tìm kiếm xe phù hợp nhu cầu' },
                            { icon: MessageCircle, title: 'Liên hệ', desc: 'Chat với người bán' },
                            { icon: Shield, title: 'Xem xe', desc: 'Kiểm tra thực tế' },
                            { icon: CreditCard, title: 'Thanh toán', desc: 'Hoàn tất giao dịch' },
                        ].map((step, idx) => (
                            <div key={step.title} className="relative flex flex-col items-center text-center p-6">
                                {idx < 3 && <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-muted-foreground" />}
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <step.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">{step.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Safety Tips */}
                <Card className="mb-16 border-primary/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Lưu ý an toàn khi giao dịch</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {safetyTips.map((tip, idx) => (
                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${tip.icon === AlertTriangle ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20'}`}>
                                    <tip.icon className={`h-5 w-5 ${tip.icon === AlertTriangle ? 'text-orange-500' : 'text-green-500'}`} />
                                    <span className="text-sm">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* FAQs */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-8">Câu hỏi thường gặp</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, idx) => (
                            <Card key={idx}>
                                <CardHeader className="py-4">
                                    <CardTitle className="text-base">{faq.q}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-muted/40 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-foreground">Vẫn cần hỗ trợ?</h2>
                    <p className="mt-2 text-muted-foreground">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat với hỗ trợ
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link to={ROUTES.HOME}>
                                Quay về trang chủ
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
