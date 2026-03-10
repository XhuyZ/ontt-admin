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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Upload } from 'lucide-react'
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
  CATEGORY_IDS,
  type CategoryKey,
  type Product,
  type ProductImage,
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
    <div className="min-w-0 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm
          </p>
        </div>
        <AddProductDialog />
      </div>

      <CategoryFilter current={category} />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
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

function EditProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(product.name)
  const [categoryId, setCategoryId] = useState<string>(
    product.category?.id ?? ''
  )
  const [images, setImages] = useState<ProductImage[]>(product.images ?? [])
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; categoryId?: string }) =>
      updateProduct(product.id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Đã cập nhật sản phẩm')
      setImages(data.images ?? [])
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(product.name)
      setCategoryId(product.category?.id ?? '')
      setImages(product.images ?? [])
    }
    setOpen(next)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const uploaded = await uploadProductImage(product.id, file)
        setImages((prev) => [...prev, uploaded])
      }
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Đã thêm ảnh')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    updateMutation.mutate({
      name: name.trim(),
      categoryId: categoryId || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="secondary"
        size="sm"
        className="flex-1"
        onClick={() => setOpen(true)}
      >
        Sửa
      </Button>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 md:grid-cols-2 md:gap-6">
          <div className="space-y-3">
            <Label>Hình ảnh</Label>
            <div
              className="flex min-h-[200px] flex-col gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleUpload(e.dataTransfer.files)
              }}
              onClick={() =>
                (document.getElementById(`upload-product-${product.id}`) as HTMLInputElement)?.click()
              }
            >
              <input
                id={`upload-product-${product.id}`}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square overflow-hidden rounded-md bg-muted"
                  >
                    <img
                      src={img.imgUrl ?? `https://api.opnhuatuankiet.io.vn${img.url}`}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <Upload className="size-8" />
                {uploading ? (
                  <span>Đang tải lên...</span>
                ) : (
                  <span>Kéo thả ảnh hoặc bấm để chọn (nhiều ảnh)</span>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên sản phẩm</Label>
              <Input
                id="edit-name"
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
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoryFilter({ current }: { current: CategoryKey }) {
  const navigate = Route.useNavigate()
  const categories = Object.keys(CATEGORY_IDS) as CategoryKey[]

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
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
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Đã xóa sản phẩm')
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const imageUrl = product.images?.[0]?.imgUrl ?? null

  return (
    <>
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
        <CardFooter className="flex gap-2 p-4 pt-0">
          <EditProductDialog product={product} />
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Xóa
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm &quot;{product.name}&quot;? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                deleteMutation.mutate()
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
