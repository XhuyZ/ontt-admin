const API_BASE = 'https://api.opnhuatuankiet.io.vn'

export interface ProductImage {
  id: string
  url: string
  imgUrl: string
}

export interface ProductCategory {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  images: ProductImage[]
}

export const CATEGORY_IDS = {
  all: null,
  'Lam sóng': '4aa9c891-0057-4c57-90ee-dde4bb95814f',
  'Nhựa Nano': '9ea33d43-a9af-48f0-a9b9-f46f8b7cd2c3',
  'Tấm PVC': '0ae4ef5a-3152-4568-88dc-c3aeaf7f607a',
  'Than Tre': '76417d0c-cc74-4f9d-85e2-b7113aeb0d92',
} as const

export type CategoryKey = keyof typeof CATEGORY_IDS

export async function fetchProducts(categoryId: string | null): Promise<Product[]> {
  const url = categoryId
    ? `${API_BASE}/products/category/${categoryId}`
    : `${API_BASE}/products`
  const res = await fetch(url, { headers: { Accept: '*/*' } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface CreateProductPayload {
  name: string
  categoryId: string
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
