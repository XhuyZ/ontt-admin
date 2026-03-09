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
  fetchProjects,
  createProject,
  PROJECT_CATEGORY_IDS,
  type ProjectCategoryKey,
  type Project,
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Công trình thi công</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách công trình thi công
          </p>
        </div>
        <AddProjectDialog />
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
      <DialogContent className="sm:max-w-md">
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

function CategoryFilter({ current }: { current: ProjectCategoryKey }) {
  const navigate = Route.useNavigate()
  const categories = Object.keys(PROJECT_CATEGORY_IDS) as ProjectCategoryKey[]

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

function ProjectCard({ project }: { project: Project }) {
  const imageUrl = project.images[0]?.imgUrl ?? null

  return (
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
      <CardFooter className="p-4 pt-0">
        <Button variant="secondary" size="sm" className="w-full">
          Sửa
        </Button>
      </CardFooter>
    </Card>
  )
}
