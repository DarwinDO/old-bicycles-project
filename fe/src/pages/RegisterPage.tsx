import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Bike, Check, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      })

      setSuccess(true)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordValid = formData.password.length >= 8
  const hasUppercase = /[A-Z]/.test(formData.password)
  const hasNumber = /[0-9]/.test(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Bike className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">BikeExchange</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
            <CardDescription>Tham gia cộng đồng mua bán xe đạp lớn nhất</CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <Check className="h-7 w-7 text-green-600" />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold">Kiểm tra email để xác thực tài khoản</p>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi đã gửi liên kết xác thực tới <span className="font-medium text-foreground">{formData.email}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bạn chưa thể đăng nhập cho đến khi nhấn vào liên kết xác thực trong email.
                  </p>
                </div>


                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button className="flex-1" asChild>
                    <Link to={ROUTES.LOGIN}>Tới trang đăng nhập</Link>
                  </Button>
                  <Button className="flex-1" variant="outline" asChild>
                    <Link to={ROUTES.REGISTER}>Đăng ký tài khoản khác</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bạn muốn</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                      className={cn(
                        'rounded-lg border-2 p-4 text-center transition-all',
                        formData.role === 'buyer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                      )}
                    >
                      <div className="font-medium">Mua xe</div>
                      <div className="text-sm text-muted-foreground">Tìm xe đạp phù hợp</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
                      className={cn(
                        'rounded-lg border-2 p-4 text-center transition-all',
                        formData.role === 'seller' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                      )}
                    >
                      <div className="font-medium">Bán xe</div>
                      <div className="text-sm text-muted-foreground">Đăng tin bán xe</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Họ
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Nguyễn"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Văn A"
                      className="pl-10"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0901234567"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className={cn('flex items-center gap-1', isPasswordValid ? 'text-green-600' : 'text-muted-foreground')}>
                      <Check className="h-3 w-3" /> Ít nhất 8 ký tự
                    </div>
                    <div className={cn('flex items-center gap-1', hasUppercase ? 'text-green-600' : 'text-muted-foreground')}>
                      <Check className="h-3 w-3" /> Có chữ hoa
                    </div>
                    <div className={cn('flex items-center gap-1', hasNumber ? 'text-green-600' : 'text-muted-foreground')}>
                      <Check className="h-3 w-3" /> Có số
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />

                    {formData.confirmPassword && (
                      <div
                        className={cn(
                          'absolute right-3 top-1/2 -translate-y-1/2',
                          passwordsMatch ? 'text-green-600' : 'text-red-500',
                        )}
                      >
                        {passwordsMatch ? <Check className="h-4 w-4" /> : '×'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                    Tôi đồng ý với{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </Link>{' '}
                    và{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </Link>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </form>
            )}

            {!success && (
              <>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    hoặc
                  </span>
                </div>

                <Button variant="outline" className="w-full" type="button">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Đăng ký với Google
                </Button>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
