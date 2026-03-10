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
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
  uploadProjectImage,
  PROJECT_CATEGORY_IDS,
  type ProjectCategoryKey,
  type Project,
  type ProjectImage,
} from '@/api/cong-trinh-thi-cong'

const PROJECT_CATEGORY_OPTIONS = (
  Object.entries(PROJECT_CATEGORY_IDS) as [ProjectCategoryKey, string | null][]
).filter(([key, id]) => key !== 'all' && id)

const PROJECT_CATEGORY_ITEMS: Record<string, string> = Object.fromEntries(
  PROJECT_CATEGORY_OPTIONS.map(([label, id]) => [id!, label])
)

export const Route = createFileRoute('/_admin/cong-trinh-thi-cong')({
  component: CongTrinhThiCongPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: ((search.category as ProjectCategoryKey) || 'all') as ProjectCategoryKey,
  }),
})

function CongTrinhThiCongPage() {
  const { category } = Route.useSearch()
  const categoryId = PROJECT_CATEGORY_IDS[category] ?? null

  const { data, isLoading } = useQuery({
    queryKey: ['projects', categoryId],
    queryFn: () => fetchProjects(categoryId),
  })

  return (
    <div className="min-w-0 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">Công trình thi công</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách công trình thi công
          </p>
        </div>
        <AddProjectDialog />
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
          {data?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          Chưa có công trình nào trong danh mục này
        </div>
      )}
    </div>
  )
}

function AddProjectDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [projectCategoryId, setProjectCategoryId] = useState<string>('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Thêm công trình thành công')
      setName('')
      setProjectCategoryId('')
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên công trình')
      return
    }
    if (!projectCategoryId) {
      toast.error('Vui lòng chọn phân loại')
      return
    }
    mutation.mutate({ name: name.trim(), projectCategoryId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 size-4" />
            Thêm công trình
          </Button>
        }
      />
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm công trình mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Tên công trình</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên công trình"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phân loại</Label>
              <Select
                value={projectCategoryId || null}
                onValueChange={(v) => setProjectCategoryId(v ?? '')}
                items={PROJECT_CATEGORY_ITEMS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phân loại" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORY_OPTIONS.map(([label, id]) => (
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
              {mutation.isPending ? 'Đang thêm...' : 'Thêm công trình'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(project.name)
  const [projectCategoryId, setProjectCategoryId] = useState<string>(
    project.projectCategory?.id ?? ''
  )
  const [images, setImages] = useState<ProjectImage[]>(project.images ?? [])
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (payload: {
      name: string
      projectCategoryId?: string
    }) => updateProject(project.id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Đã cập nhật công trình')
      setImages(data.images ?? [])
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(project.name)
      setProjectCategoryId(project.projectCategory?.id ?? '')
      setImages(project.images ?? [])
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
        const uploaded = await uploadProjectImage(project.id, file)
        setImages((prev) => [...prev, uploaded])
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] })
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
      toast.error('Vui lòng nhập tên công trình')
      return
    }
    updateMutation.mutate({
      name: name.trim(),
      projectCategoryId: projectCategoryId || undefined,
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
          <DialogTitle>Sửa công trình</DialogTitle>
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
                (
                  document.getElementById(
                    `upload-project-${project.id}`
                  ) as HTMLInputElement
                )?.click()
              }
            >
              <input
                id={`upload-project-${project.id}`}
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
                      src={
                        img.imgUrl ??
                        `https://api.opnhuatuankiet.io.vn${img.url}`
                      }
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
              <Label htmlFor="edit-project-name">Tên công trình</Label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên công trình"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phân loại</Label>
              <Select
                value={projectCategoryId || null}
                onValueChange={(v) => setProjectCategoryId(v ?? '')}
                items={PROJECT_CATEGORY_ITEMS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phân loại" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORY_OPTIONS.map(([label, id]) => (
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

function CategoryFilter({ current }: { current: ProjectCategoryKey }) {
  const navigate = Route.useNavigate()
  const categories = Object.keys(PROJECT_CATEGORY_IDS) as ProjectCategoryKey[]

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

function ProjectCard({ project }: { project: Project }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Đã xóa công trình')
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    },
  })

  const imageUrl = project.images?.[0]?.imgUrl ?? null

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={project.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              Chưa có ảnh
            </div>
          )}
        </div>
        <CardHeader className="space-y-1 p-4 pb-2">
          <h3 className="line-clamp-2 font-medium">{project.name}</h3>
          <span className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {project.projectCategory.name}
          </span>
        </CardHeader>
        <CardFooter className="flex gap-2 p-4 pt-0">
          <EditProjectDialog project={project} />
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
              Bạn có chắc muốn xóa công trình &quot;{project.name}&quot;? Hành
              động này không thể hoàn tác.
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
