import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import {
  fetchProducts,
  createProduct,
  CATEGORY_IDS,
  type CategoryKey,
  type Product,
} from '@/api/san-pham'

const CATEGORY_OPTIONS = (
  Object.entries(CATEGORY_IDS) as [CategoryKey, string | null][]
).filter(([key, id]) => key !== 'all' && id)

const CATEGORY_ITEMS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map(([label, id]) => [id!, label])
)

export const Route = createFileRoute('/_admin/san-pham')({
  component: SanPhamPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: ((search.category as CategoryKey) || 'all') as CategoryKey,
  }),
})

function SanPhamPage() {
  const { category } = Route.useSearch()
  const categoryId = CATEGORY_IDS[category] ?? null

  const { data, isLoading } = useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => fetchProducts(categoryId),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm
          </p>
        </div>
        <AddProductDialog />
      </div>

      <CategoryFilter current={category} />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardHeader className="space-y-1">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          Chưa có sản phẩm nào trong danh mục này
        </div>
      )}
    </div>
  )
}

function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Thêm sản phẩm thành công')
      setName('')
      setCategoryId('')
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn phân loại')
      return
    }
    mutation.mutate({ name: name.trim(), categoryId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 size-4" />
            Thêm sản phẩm
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phân loại</Label>
              <Select
                value={categoryId || null}
                onValueChange={(v) => setCategoryId(v ?? '')}
                items={CATEGORY_ITEMS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phân loại" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(([label, id]) => (
                    <SelectItem key={id!} value={id!}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CategoryFilter({ current }: { current: CategoryKey }) {
  const navigate = Route.useNavigate()
  const categories = Object.keys(CATEGORY_IDS) as CategoryKey[]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((key) => (
        <Button
          key={key}
          variant={current === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => navigate({ search: { category: key } })}
        >
          {key === 'all' ? 'Tất cả' : key}
        </Button>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images?.[0]?.imgUrl ?? null

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-square bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
      </div>
      <CardHeader className="space-y-1 p-4 pb-2">
        <h3 className="line-clamp-2 font-medium">{product.name}</h3>
        <span className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {product.category?.name ?? '-'}
        </span>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Button variant="secondary" size="sm" className="w-full">
          Sửa
        </Button>
      </CardFooter>
    </Card>
  )
}
