import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Camera, Info, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const bikeCategories = ['Road', 'MTB', 'Gravel', 'Touring', 'City', 'BMX']
const bikeBrands = ['Giant', 'Trek', 'Specialized', 'Canyon', 'Cannondale', 'Bianchi', 'Scott', 'Merida', 'Khác']
const frameSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const wheelSizes = ['26"', '27.5"', '29"', '700c']
const brakeTypes = ['Đĩa thủy lực', 'Đĩa cơ', 'V-brake', 'Caliper']
const frameMaterials = ['Carbon', 'Nhôm', 'Thép', 'Titanium']
const conditions = ['Như mới (95%+)', 'Tốt (80-95%)', 'Đã qua sử dụng (60-80%)', 'Cần sửa chữa']

interface FormData {
    title: string
    category: string
    brand: string
    model: string
    year: string
    frameSize: string
    wheelSize: string
    brakeType: string
    frameMaterial: string
    groupset: string
    condition: string
    price: string
    originalPrice: string
    description: string
    province: string
    district: string
    images: { file: File; preview: string; type: 'main' | 'groupset' | 'serial' | 'other' }[]
}

const requiredImageTypes = [
    { type: 'main', label: 'Ảnh toàn thân xe', required: true },
    { type: 'groupset', label: 'Ảnh bộ truyền động', required: true },
    { type: 'serial', label: 'Ảnh số khung (serial)', required: true },
]

export default function SellBikePage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        title: '', category: '', brand: '', model: '', year: '',
        frameSize: '', wheelSize: '', brakeType: '', frameMaterial: '',
        groupset: '', condition: '', price: '', originalPrice: '',
        description: '', province: '', district: '', images: []
    })

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'groupset' | 'serial' | 'other') => {
        const files = e.target.files
        if (!files) return

        const newImages = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type
        }))

        setFormData(prev => ({
            ...prev,
            images: [...prev.images.filter(img => type === 'other' || img.type !== type), ...newImages]
        }))
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            navigate(ROUTES.HOME)
        }, 1500)
    }

    const steps = [
        { num: 1, label: 'Thông tin cơ bản' },
        { num: 2, label: 'Thông số kỹ thuật' },
        { num: 3, label: 'Hình ảnh' },
        { num: 4, label: 'Giá & Địa điểm' },
    ]

    return (
        <div className="min-h-screen bg-muted/40 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">Đăng tin bán xe</h1>
                    <p className="mt-2 text-muted-foreground">Điền đầy đủ thông tin để tin đăng được duyệt nhanh hơn</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors",
                                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={cn(
                                "hidden sm:block ml-2 text-sm",
                                step >= s.num ? "text-foreground" : "text-muted-foreground"
                            )}>{s.label}</span>
                            {i < steps.length - 1 && (
                                <div className={cn(
                                    "w-12 sm:w-24 h-1 mx-2 rounded",
                                    step > s.num ? "bg-primary" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Nhập thông tin chung về xe đạp của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tiêu đề tin đăng *</label>
                                <Input placeholder="VD: Giant TCR Advanced Pro 2023 - Size M" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Loại xe *</label>
                                <div className="flex flex-wrap gap-2">
                                    {bikeCategories.map(cat => (
                                        <Button key={cat} type="button" variant={formData.category === cat ? 'default' : 'outline'} size="sm" onClick={() => handleChange('category', cat)}>{cat}</Button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thương hiệu *</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)}>
                                        <option value="">Chọn thương hiệu</option>
                                        {bikeBrands.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Model</label>
                                    <Input placeholder="VD: TCR Advanced Pro" value={formData.model} onChange={(e) => handleChange('model', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Năm sản xuất</label>
                                <Input type="number" placeholder="VD: 2023" value={formData.year} onChange={(e) => handleChange('year', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tình trạng *</label>
                                <div className="flex flex-wrap gap-2">
                                    {conditions.map(c => (
                                        <Button key={c} type="button" variant={formData.condition === c ? 'default' : 'outline'} size="sm" onClick={() => handleChange('condition', c)}>{c}</Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mô tả chi tiết</label>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Mô tả chi tiết về xe đạp của bạn: tình trạng, lịch sử sử dụng, lý do bán..."
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Technical Specs */}
                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông số kỹ thuật</CardTitle>
                            <CardDescription>Các thông số này giúp người mua tìm kiếm dễ dàng hơn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Size khung *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {frameSizes.map(s => (
                                            <Button key={s} type="button" variant={formData.frameSize === s ? 'default' : 'outline'} size="sm" onClick={() => handleChange('frameSize', s)}>{s}</Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kích thước bánh *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {wheelSizes.map(s => (
                                            <Button key={s} type="button" variant={formData.wheelSize === s ? 'default' : 'outline'} size="sm" onClick={() => handleChange('wheelSize', s)}>{s}</Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Loại phanh *</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.brakeType} onChange={(e) => handleChange('brakeType', e.target.value)}>
                                        <option value="">Chọn loại phanh</option>
                                        {brakeTypes.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Chất liệu khung *</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.frameMaterial} onChange={(e) => handleChange('frameMaterial', e.target.value)}>
                                        <option value="">Chọn chất liệu</option>
                                        {frameMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bộ truyền động (Groupset)</label>
                                <Input placeholder="VD: Shimano Ultegra R8000, SRAM Force..." value={formData.groupset} onChange={(e) => handleChange('groupset', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Images */}
                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hình ảnh</CardTitle>
                            <CardDescription>Tối thiểu 3 ảnh bắt buộc theo quy định</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                                <Info className="h-5 w-5 text-primary shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">Yêu cầu hình ảnh</p>
                                    <ul className="mt-1 text-muted-foreground list-disc list-inside">
                                        <li>Ảnh toàn thân xe (bắt buộc)</li>
                                        <li>Ảnh bộ truyền động (bắt buộc)</li>
                                        <li>Ảnh số khung serial (bắt buộc - để xác minh)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {requiredImageTypes.map((imgType) => {
                                    const existingImage = formData.images.find(img => img.type === imgType.type)
                                    return (
                                        <div key={imgType.type} className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-1">
                                                {imgType.label} <span className="text-red-500">*</span>
                                            </label>
                                            {existingImage ? (
                                                <div className="relative aspect-square rounded-lg overflow-hidden border">
                                                    <img src={existingImage.preview} alt="" className="w-full h-full object-cover" />
                                                    <button onClick={() => removeImage(formData.images.indexOf(existingImage))} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    <Badge className="absolute bottom-2 left-2" variant="secondary">✓</Badge>
                                                </div>
                                            ) : (
                                                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground mt-2">Tải lên</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imgType.type as 'main' | 'groupset' | 'serial')} />
                                                </label>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ảnh bổ sung (tùy chọn)</label>
                                <div className="grid gap-4 grid-cols-4">
                                    {formData.images.filter(img => img.type === 'other').map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(formData.images.indexOf(img))} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'other')} />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Price & Location */}
                {step === 4 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Giá bán & Địa điểm</CardTitle>
                            <CardDescription>Thông tin để người mua liên hệ với bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Giá bán *</label>
                                    <Input type="number" placeholder="VD: 25000000" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Giá gốc (tùy chọn)</label>
                                    <Input type="number" placeholder="VD: 35000000" value={formData.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)} />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tỉnh/Thành phố *</label>
                                    <Input placeholder="VD: Hồ Chí Minh" value={formData.province} onChange={(e) => handleChange('province', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quận/Huyện *</label>
                                    <Input placeholder="VD: Quận 1" value={formData.district} onChange={(e) => handleChange('district', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                        Quay lại
                    </Button>
                    {step < 4 ? (
                        <Button onClick={() => setStep(step + 1)}>Tiếp tục</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang đăng...' : 'Đăng tin'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
