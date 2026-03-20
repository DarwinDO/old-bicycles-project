import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, CheckCircle2, Info, Loader2, Upload, X } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { AdministrativeLocationFields } from '@/components/AdministrativeLocationFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { ProductMutationInput } from '@/types/product'
import type { Brand, Category, ReferenceValue } from '@/types/reference-data'

const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const WHEEL_SIZES = ['26"', '27.5"', '29"', '700c']
const CONDITION_OPTIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

interface ImageEntry {
  file: File
  preview: string
  type: 'main' | 'groupset' | 'serial' | 'other'
}

interface FormState {
  title: string
  categoryId: string
  brandId: string
  frameSize: string
  wheelSize: string
  brakeTypeId: string
  frameMaterialId: string
  groupset: string
  condition: string
  price: string
  originalPrice: string
  description: string
  province: string
  district: string
  images: ImageEntry[]
}

const REQUIRED_IMAGE_TYPES: { type: ImageEntry['type']; label: string }[] = [
  { type: 'main', label: 'Ảnh toàn thân xe' },
  { type: 'groupset', label: 'Ảnh bộ truyền động' },
  { type: 'serial', label: 'Ảnh số khung (serial)' },
]

const EMPTY_FORM: FormState = {
  title: '',
  categoryId: '',
  brandId: '',
  frameSize: '',
  wheelSize: '',
  brakeTypeId: '',
  frameMaterialId: '',
  groupset: '',
  condition: '',
  price: '',
  originalPrice: '',
  description: '',
  province: '',
  district: '',
  images: [],
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  placeholder: string
  required?: boolean
  loading: boolean
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  loading,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {loading ? (
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      ) : (
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default function SellBikePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brakeTypes, setBrakeTypes] = useState<ReferenceValue[]>([])
  const [frameMaterials, setFrameMaterials] = useState<ReferenceValue[]>([])
  const [referenceLoading, setReferenceLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      referenceDataApi.getBrands(),
      referenceDataApi.getCategories(),
      referenceDataApi.getBrakeTypes(),
      referenceDataApi.getFrameMaterials(),
    ])
      .then(([loadedBrands, loadedCategories, loadedBrakeTypes, loadedFrameMaterials]) => {
        setBrands(loadedBrands)
        setCategories(loadedCategories)
        setBrakeTypes(loadedBrakeTypes)
        setFrameMaterials(loadedFrameMaterials)
      })
      .catch(() => {
        setBrands([])
        setCategories([])
        setBrakeTypes([])
        setFrameMaterials([])
      })
      .finally(() => setReferenceLoading(false))
  }, [])

  const isSellerDashboardFlow = location.pathname.startsWith(ROUTES.SELLER)

  function handleBackToPreviousPage() {
    if (isSellerDashboardFlow) {
      navigate(ROUTES.SELLER_LISTINGS)
      return
    }

    navigate(-1)
  }

  function handleChange<K extends keyof FormState>(name: K, value: FormState[K]) {
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    type: ImageEntry['type'],
  ) {
    const files = event.target.files
    if (!files) {
      return
    }

    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type,
    }))

    setFormData((current) => ({
      ...current,
      images: [...current.images.filter((image) => type === 'other' || image.type !== type), ...newImages],
    }))
  }

  function removeImage(index: number) {
    setFormData((current) => {
      URL.revokeObjectURL(current.images[index].preview)
      return { ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }
    })
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload: ProductMutationInput = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      brandId: formData.brandId || undefined,
      categoryId: formData.categoryId || undefined,
      brakeTypeId: formData.brakeTypeId || undefined,
      frameMaterialId: formData.frameMaterialId || undefined,
      frameSize: formData.frameSize || undefined,
      wheelSize: formData.wheelSize || undefined,
      groupset: formData.groupset || undefined,
      condition: (formData.condition as ProductMutationInput['condition']) || undefined,
      province: formData.province || undefined,
      district: formData.district || undefined,
      images: formData.images.map((image) => image.file),
    }

    try {
      await productsApi.create(payload)
      navigate(ROUTES.SELLER_LISTINGS)
    } catch {
      setSubmitError('Đăng tin thất bại. Vui lòng kiểm tra lại thông tin và thử lại.')
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Thông tin cơ bản' },
    { num: 2, label: 'Thông số kỹ thuật' },
    { num: 3, label: 'Hình ảnh' },
    { num: 4, label: 'Giá & địa điểm' },
  ]

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 space-y-4">
          <Button variant="ghost" className="gap-2 px-0" onClick={handleBackToPreviousPage}>
            <ArrowLeft className="h-4 w-4" />
            {isSellerDashboardFlow ? 'Quay lại quản lý tin đăng' : 'Quay lại'}
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Đăng tin bán xe</h1>
            <p className="mt-2 text-muted-foreground">
              Điền đầy đủ thông tin để tin đăng được duyệt nhanh hơn.
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {steps.map((item, index) => (
            <div key={item.num} className="flex items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  step >= item.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {step > item.num ? <CheckCircle2 className="h-5 w-5" /> : item.num}
              </div>

              <span
                className={cn(
                  'ml-2 hidden text-sm sm:block',
                  step >= item.num ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>

              {index < steps.length - 1 && (
                <div className={cn('mx-2 h-1 w-12 rounded sm:w-24', step > item.num ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập thông tin chung về xe đạp của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tiêu đề tin đăng <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Giant TCR Advanced Pro 2023 - Size M"
                  value={formData.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                />
              </div>

              <SelectField
                label="Danh mục"
                value={formData.categoryId}
                onChange={(value) => handleChange('categoryId', value)}
                options={categories}
                placeholder="Chọn danh mục"
                required
                loading={referenceLoading}
              />

              <SelectField
                label="Thương hiệu"
                value={formData.brandId}
                onChange={(value) => handleChange('brandId', value)}
                options={brands}
                placeholder="Chọn thương hiệu"
                required
                loading={referenceLoading}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tình trạng <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((condition) => (
                    <Button
                      key={condition.value}
                      type="button"
                      variant={formData.condition === condition.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleChange('condition', condition.value)}
                    >
                      {condition.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả chi tiết</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Mô tả chi tiết về xe đạp của bạn: tình trạng, lịch sử sử dụng, lý do bán..."
                  value={formData.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông số kỹ thuật</CardTitle>
              <CardDescription>Các thông số này giúp người mua tìm kiếm dễ dàng hơn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size khung</label>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_SIZES.map((frameSize) => (
                      <Button
                        key={frameSize}
                        type="button"
                        variant={formData.frameSize === frameSize ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('frameSize', frameSize)}
                      >
                        {frameSize}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kích thước bánh</label>
                  <div className="flex flex-wrap gap-2">
                    {WHEEL_SIZES.map((wheelSize) => (
                      <Button
                        key={wheelSize}
                        type="button"
                        variant={formData.wheelSize === wheelSize ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('wheelSize', wheelSize)}
                      >
                        {wheelSize}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Loại phanh"
                  value={formData.brakeTypeId}
                  onChange={(value) => handleChange('brakeTypeId', value)}
                  options={brakeTypes}
                  placeholder="Chọn loại phanh"
                  loading={referenceLoading}
                />

                <SelectField
                  label="Chất liệu khung"
                  value={formData.frameMaterialId}
                  onChange={(value) => handleChange('frameMaterialId', value)}
                  options={frameMaterials}
                  placeholder="Chọn chất liệu"
                  loading={referenceLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bộ truyền động (Groupset)</label>
                <Input
                  placeholder="VD: Shimano Ultegra R8000, SRAM Force..."
                  value={formData.groupset}
                  onChange={(event) => handleChange('groupset', event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>Tối thiểu 3 ảnh bắt buộc theo quy định.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Yêu cầu hình ảnh</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    <li>Ảnh toàn thân xe (bắt buộc)</li>
                    <li>Ảnh bộ truyền động (bắt buộc)</li>
                    <li>Ảnh số khung serial (bắt buộc)</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {REQUIRED_IMAGE_TYPES.map((imageType) => {
                  const existingImage = formData.images.find((image) => image.type === imageType.type)

                  return (
                    <div key={imageType.type} className="space-y-2">
                      <label className="flex items-center gap-1 text-sm font-medium">
                        {imageType.label} <span className="text-red-500">*</span>
                      </label>

                      {existingImage ? (
                        <div className="relative aspect-square overflow-hidden rounded-lg border">
                          <img src={existingImage.preview} alt="" className="h-full w-full object-cover" />
                          <button
                            onClick={() => removeImage(formData.images.indexOf(existingImage))}
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="mt-2 text-sm text-muted-foreground">Tải lên</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleImageUpload(event, imageType.type)}
                          />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Ảnh bổ sung (tùy chọn)</label>
                <div className="grid grid-cols-4 gap-4">
                  {formData.images
                    .filter((image) => image.type === 'other')
                    .map((image, index) => {
                      const realIndex = formData.images.indexOf(image)

                      return (
                        <div key={`${image.preview}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border">
                          <img src={image.preview} alt="" className="h-full w-full object-cover" />
                          <button
                            onClick={() => removeImage(realIndex)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}

                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleImageUpload(event, 'other')}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Giá bán & địa điểm</CardTitle>
              <CardDescription>Thông tin để người mua dễ cân nhắc và liên hệ với bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="VD: 25000000"
                    value={formData.price}
                    onChange={(event) => handleChange('price', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá gốc (tùy chọn)</label>
                  <Input
                    type="number"
                    placeholder="VD: 35000000"
                    value={formData.originalPrice}
                    onChange={(event) => handleChange('originalPrice', event.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <AdministrativeLocationFields
                province={formData.province}
                district={formData.district}
                onProvinceChange={(value) => handleChange('province', value)}
                onDistrictChange={(value) => handleChange('district', value)}
                provinceRequired
              />

              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
            disabled={step === 1 || isSubmitting}
          >
            Quay lại
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep((currentStep) => currentStep + 1)}>Tiếp tục</Button>
          ) : (
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                'Đăng tin'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
