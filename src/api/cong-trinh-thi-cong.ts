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
