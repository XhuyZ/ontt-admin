const API_BASE = 'https://api.opnhuatuankiet.io.vn'

export interface ProjectImage {
  id: string
  url: string
  imgUrl: string
}

export interface ProjectCategory {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
  projectCategory: ProjectCategory
  images: ProjectImage[]
}

export const PROJECT_CATEGORY_IDS = {
  all: null,
  'Trần': '66f78ef9-14ec-429a-9f17-eb2d7f05e25f',
  'Phòng Thờ': '7907a2d0-c5a2-4d2a-ac2d-2680365f50e2',
  'Phòng khách': '01338b05-735e-4fc5-b52d-46d7eb6fd26e',
  'Lam sóng PVC vách TV': '8cfbba31-c74b-4224-b0f2-3b5f8176ce76',
} as const

export type ProjectCategoryKey = keyof typeof PROJECT_CATEGORY_IDS

export async function fetchProjects(
  categoryId: string | null
): Promise<Project[]> {
  const url = categoryId
    ? `${API_BASE}/project/category/${categoryId}`
    : `${API_BASE}/project`
  const res = await fetch(url, { headers: { Accept: '*/*' } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface CreateProjectPayload {
  name: string
  projectCategoryId: string
}

export async function createProject(
  payload: CreateProjectPayload
): Promise<Project> {
  const res = await fetch(`${API_BASE}/project`, {
    method: 'POST',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function deleteProject(
  id: string
): Promise<{ deleted: boolean }> {
  const res = await fetch(`${API_BASE}/project/${id}`, {
    method: 'DELETE',
    headers: { Accept: '*/*' },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface UpdateProjectPayload {
  name?: string
  projectCategoryId?: string
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<Project> {
  const res = await fetch(`${API_BASE}/project/${id}`, {
    method: 'PATCH',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function uploadProjectImage(
  projectId: string,
  file: File
): Promise<ProjectImage> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(
    `${API_BASE}/images/upload/project/${projectId}`,
    {
      method: 'POST',
      headers: { Accept: '*/*' },
      body: formData,
    }
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
