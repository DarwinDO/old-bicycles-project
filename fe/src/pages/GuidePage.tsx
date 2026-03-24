import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Search,
  Shield,
} from 'lucide-react'
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
    ],
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
    ],
  },
  {
    icon: Shield,
    title: 'Kiểm định xe đạp',
    description: 'Dịch vụ kiểm định để đảm bảo chất lượng trước khi public',
    items: [
      'Kiểm tra khung xe, dấu hiệu va chạm hoặc nứt gãy',
      'Kiểm tra bộ truyền động và các linh kiện chính',
      'Xác minh số serial nếu cần',
      'Đánh giá tổng thể và lập báo cáo kiểm định',
    ],
  },
]

const safetyTips = [
  { icon: CheckCircle, text: 'Luôn gặp mặt trực tiếp tại nơi công cộng hoặc điểm hẹn an toàn' },
  { icon: CheckCircle, text: 'Kiểm tra xe kỹ trước khi xác nhận đặt cọc hoặc thanh toán' },
  { icon: CheckCircle, text: 'Xác minh thông tin người bán và lịch sử giao dịch nếu có' },
  { icon: AlertTriangle, text: 'Không chuyển tiền trước khi hiểu rõ tình trạng xe và điều khoản giao dịch' },
  { icon: AlertTriangle, text: 'Cảnh giác với mức giá quá rẻ so với mặt bằng chung' },
]

const faqs = [
  {
    q: 'Làm thế nào để biết xe đạp có bị đâm đổ hay nứt khung không?',
    a: 'Hãy kiểm tra kỹ các mối hàn, vết nứt và dấu hiệu cong vênh trên khung. Nếu cần chắc chắn hơn, bạn nên dùng dịch vụ kiểm định để có báo cáo kỹ thuật rõ ràng.',
  },
  {
    q: 'Phí kiểm định xe là bao nhiêu?',
    a: 'Chi phí kiểm định phụ thuộc vào loại xe và mức độ chi tiết của gói kiểm tra. Bạn có thể xem thông tin trên nền tảng hoặc nhắn trợ lý để được giải thích luồng kiểm định hiện tại.',
  },
  {
    q: 'Tôi có thể hủy giao dịch không?',
    a: 'Bạn có thể hủy trước khi hoàn tất thanh toán hoặc trước khi giao dịch đi đến bước bị ràng buộc bởi nghiệp vụ đặt cọc. Sau khi đã thanh toán, hệ thống sẽ xử lý theo luồng refund hoặc dispute tương ứng.',
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ?',
    a: 'Bạn có thể mở Trợ lý BikeExchange để hỏi trực tiếp về order, tin đăng, inspection, refund hoặc payout. Trợ lý sẽ đọc context thật của tài khoản đang đăng nhập để hướng dẫn chính xác hơn.',
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/90 to-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-white" />
          <h1 className="text-3xl font-bold text-white md:text-4xl">Trung tâm hướng dẫn</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Tất cả những gì bạn cần biết để mua bán xe đạp an toàn, rõ ràng và hiệu quả trên BikeExchange
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {guides.map((guide) => (
            <Card key={guide.title} className="h-full">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <guide.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {guide.items.map((item, idx) => (
                    <li key={item} className="flex items-start gap-3">
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

        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Quy trình giao dịch</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Search, title: 'Tìm xe', desc: 'Tìm kiếm xe phù hợp với nhu cầu và ngân sách' },
              { icon: MessageCircle, title: 'Liên hệ', desc: 'Trao đổi với người bán hoặc mở trợ lý để hỏi quy trình' },
              { icon: Shield, title: 'Kiểm tra', desc: 'Xem xe trực tiếp hoặc theo luồng kiểm định của hệ thống' },
              { icon: CreditCard, title: 'Thanh toán', desc: 'Đặt cọc và hoàn tất giao dịch theo trạng thái đơn hàng' },
            ].map((step, idx) => (
              <div key={step.title} className="relative flex flex-col items-center p-6 text-center">
                {idx < 3 && (
                  <ChevronRight className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-muted-foreground md:block" />
                )}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mb-16 border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Lưu ý an toàn khi giao dịch</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {safetyTips.map((tip) => (
                <div
                  key={tip.text}
                  className={`flex items-center gap-3 rounded-lg p-3 ${
                    tip.icon === AlertTriangle
                      ? 'bg-orange-50 dark:bg-orange-950/20'
                      : 'bg-green-50 dark:bg-green-950/20'
                  }`}
                >
                  <tip.icon
                    className={`h-5 w-5 ${tip.icon === AlertTriangle ? 'text-orange-500' : 'text-green-500'}`}
                  />
                  <span className="text-sm">{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Câu hỏi thường gặp</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q}>
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

        <div className="rounded-2xl bg-muted/40 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">Vẫn cần hỗ trợ?</h2>
          <p className="mt-2 text-muted-foreground">
            Mở Trợ lý BikeExchange để hỏi trực tiếp về order, tin đăng, inspection, refund hoặc payout
          </p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to={ROUTES.ASSISTANT}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Mở Trợ lý
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={ROUTES.HOME}>Quay về trang chủ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
