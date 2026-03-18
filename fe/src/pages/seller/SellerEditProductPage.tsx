import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, Info, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import type { Brand, Category, ReferenceValue } from '@/types/reference-data'
import type { ProductMutationInput } from '@/types/product'

const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const WHEEL_SIZES = ['26"', '27.5"', '29"', '700c']
const CONDITION_OPTIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

interface NewImageEntry {
  file: File
  preview: string
  isNew: true
}
interface ExistingImageEntry {
  url: string
  id: string
  isNew: false
}
type ImageEntry = NewImageEntry | ExistingImageEntry

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

export default function SellerEditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>({
    title: '', categoryId: '', brandId: '', frameSize: '', wheelSize: '',
    brakeTypeId: '', frameMaterialId: '', groupset: '', condition: '',
    price: '', originalPrice: '', description: '', province: '', district: '', images: [],
  })

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brakeTypes, setBrakeTypes] = useState<ReferenceValue[]>([])
  const [frameMaterials, setFrameMaterials] = useState<ReferenceValue[]>([])
  const [refLoading, setRefLoading] = useState(true)

  // Load reference data and product data
  useEffect(() => {
    if (!id) return

    Promise.all([
      referenceDataApi.getBrands(),
      referenceDataApi.getCategories(),
      referenceDataApi.getBrakeTypes(),
      referenceDataApi.getFrameMaterials(),
      productsApi.getMineById(id)
    ])
      .then(([b, c, bt, fm, p]) => {
        setBrands(b)
        setCategories(c)
        setBrakeTypes(bt)
        setFrameMaterials(fm)

        // match names to IDs
        const matchedCategory = c.find((cat) => cat.name === p.categoryName)
        const matchedBrand = b.find((brand) => brand.name === p.brandName)
        const matchedBrake = bt.find((brake) => brake.name === p.brakeTypeName)
        const matchedMaterial = fm.find((mat) => mat.name === p.frameMaterialName)

        setFormData({
          title: p.title ?? '',
          categoryId: matchedCategory?.id ?? '',
          brandId: matchedBrand?.id ?? '',
          frameSize: p.frameSize ?? '',
          wheelSize: p.wheelSize ?? '',
          brakeTypeId: matchedBrake?.id ?? '',
          frameMaterialId: matchedMaterial?.id ?? '',
          groupset: p.groupset ?? '',
          condition: p.condition ?? '',
          price: String(p.price ?? ''),
          originalPrice: String(p.originalPrice ?? ''),
          description: p.description ?? '',
          province: p.province ?? '',
          district: p.district ?? '',
          images: (p.images ?? []).map((img) => ({ url: img.url, id: img.id, isNew: false as const })),
        })
      })
      .catch((err) => {
        console.error('Failed to load edit product data:', err)
        navigate(ROUTES.SELLER_LISTINGS)
      })
      .finally(() => {
        setRefLoading(false)
        setIsLoadingProduct(false)
      })
  }, [id, navigate])

  const handleChange = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: NewImageEntry[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }))
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const img = prev.images[index]
      if (img.isNew) URL.revokeObjectURL(img.preview)
      return { ...prev, images: prev.images.filter((_, i) => i !== index) }
    })
  }

  const handleSubmit = async () => {
    if (!id) return
    setIsSubmitting(true)
    setSubmitError(null)

    const newFiles = formData.images
      .filter((img): img is NewImageEntry => img.isNew)
      .map((img) => img.file)

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
      images: newFiles.length > 0 ? newFiles : undefined,
    }

    try {
      await productsApi.update(id, payload)
      navigate(ROUTES.SELLER_LISTINGS)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string, errors?: Record<string, string> } } })?.response
      const beMsg = res?.data?.message
      const beErrors = res?.data?.errors
      
      console.error('Update Product Error Payload:', payload)
      console.error('Update Product Error Response:', res?.data)

      if (beErrors && Object.keys(beErrors).length > 0) {
        setSubmitError(`Lỗi dữ liệu: ${Object.values(beErrors).join(', ')}`)
      } else {
        setSubmitError(beMsg || 'Cập nhật thất bại. Vui lòng thử lại.')
      }
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Thông tin cơ bản' },
    { num: 2, label: 'Thông số kỹ thuật' },
    { num: 3, label: 'Hình ảnh' },
    { num: 4, label: 'Giá & Địa điểm' },
  ]

  const SelectField = ({
    label, value, onChange, options, placeholder,
  }: {
    label: string; value: string; onChange: (v: string) => void
    options: { id: string; name: string }[]; placeholder: string
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {refLoading ? (
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tải...
        </div>
      ) : (
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      )}
    </div>
  )

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Chỉnh sửa tin đăng</h1>
          <p className="mt-2 text-muted-foreground">Cập nhật thông tin xe đạp của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
                step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}>
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={cn('hidden sm:block ml-2 text-sm', step >= s.num ? 'text-foreground' : 'text-muted-foreground')}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn('w-12 sm:w-24 h-1 mx-2 rounded', step > s.num ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Chỉnh sửa thông tin chung về xe đạp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề tin đăng <span className="text-red-500">*</span></label>
                <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
              </div>
              <SelectField label="Danh mục" value={formData.categoryId} onChange={(v) => handleChange('categoryId', v)} options={categories} placeholder="Chọn danh mục" />
              <SelectField label="Thương hiệu" value={formData.brandId} onChange={(v) => handleChange('brandId', v)} options={brands} placeholder="Chọn thương hiệu" />
              <div className="space-y-2">
                <label className="text-sm font-medium">Tình trạng</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((c) => (
                    <Button key={c.value} type="button" variant={formData.condition === c.value ? 'default' : 'outline'} size="sm" onClick={() => handleChange('condition', c.value)}>
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả chi tiết</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông số kỹ thuật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size khung</label>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_SIZES.map((s) => (
                      <Button key={s} type="button" variant={formData.frameSize === s ? 'default' : 'outline'} size="sm" onClick={() => handleChange('frameSize', s)}>{s}</Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kích thước bánh</label>
                  <div className="flex flex-wrap gap-2">
                    {WHEEL_SIZES.map((s) => (
                      <Button key={s} type="button" variant={formData.wheelSize === s ? 'default' : 'outline'} size="sm" onClick={() => handleChange('wheelSize', s)}>{s}</Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Loại phanh" value={formData.brakeTypeId} onChange={(v) => handleChange('brakeTypeId', v)} options={brakeTypes} placeholder="Chọn loại phanh" />
                <SelectField label="Chất liệu khung" value={formData.frameMaterialId} onChange={(v) => handleChange('frameMaterialId', v)} options={frameMaterials} placeholder="Chọn chất liệu" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bộ truyền động</label>
                <Input value={formData.groupset} onChange={(e) => handleChange('groupset', e.target.value)} placeholder="VD: Shimano Ultegra..." />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>Giữ nguyên ảnh cũ hoặc thêm ảnh mới để thay thế</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Ảnh hiện tại sẽ được giữ nguyên. Nếu bạn tải ảnh mới lên, ảnh cũ sẽ được thay thế.
                </p>
              </div>
              <div className="grid gap-4 grid-cols-3 sm:grid-cols-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={img.isNew ? img.preview : img.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                    {img.isNew && <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">Mới</Badge>}
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Giá bán & Địa điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá bán <span className="text-red-500">*</span></label>
                  <Input type="number" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá gốc</label>
                  <Input type="number" value={formData.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tỉnh/Thành phố</label>
                  <Input value={formData.province} onChange={(e) => handleChange('province', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quận/Huyện</label>
                  <Input value={formData.district} onChange={(e) => handleChange('district', e.target.value)} />
                </div>
              </div>
              {submitError && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{submitError}</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || isSubmitting}>
            Quay lại
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>Tiếp tục</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : 'Lưu thay đổi'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
