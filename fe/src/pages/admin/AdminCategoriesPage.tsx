import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
}

interface Brand {
    id: string;
    name: string;
    count: number;
}

const mockCategories: Category[] = [
    { id: '1', name: 'Road Bike', slug: 'road', count: 145 },
    { id: '2', name: 'Mountain Bike', slug: 'mtb', count: 89 },
    { id: '3', name: 'City Bike', slug: 'city', count: 56 },
    { id: '4', name: 'Touring', slug: 'touring', count: 34 },
    { id: '5', name: 'BMX', slug: 'bmx', count: 23 },
];

const mockBrands: Brand[] = [
    { id: '1', name: 'Giant', count: 67 },
    { id: '2', name: 'Trek', count: 54 },
    { id: '3', name: 'Specialized', count: 48 },
    { id: '4', name: 'Cannondale', count: 39 },
    { id: '5', name: 'Scott', count: 31 },
];

export default function AdminCategoriesPage() {
    const [categories] = useState(mockCategories);
    const [brands] = useState(mockBrands);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Quản lý danh mục</h2>
                <p className="text-muted-foreground">Quản lý danh mục, thương hiệu xe đạp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories */}
                <div className="bg-card border border-border rounded-lg">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Danh mục xe</h3>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm
                        </Button>
                    </div>
                    <div className="divide-y divide-border">
                        {categories.map((cat) => (
                            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div>
                                    <p className="font-medium text-foreground">{cat.name}</p>
                                    <p className="text-xs text-muted-foreground">/{cat.slug} · {cat.count} tin đăng</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Brands */}
                <div className="bg-card border border-border rounded-lg">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Thương hiệu</h3>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm
                        </Button>
                    </div>
                    <div className="divide-y divide-border">
                        {brands.map((brand) => (
                            <div key={brand.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div>
                                    <p className="font-medium text-foreground">{brand.name}</p>
                                    <p className="text-xs text-muted-foreground">{brand.count} tin đăng</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
