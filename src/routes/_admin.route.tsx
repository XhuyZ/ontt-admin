import { Link, Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Package, HardHat } from 'lucide-react'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const matchRoute = useMatchRoute()
  const isSanPham = !!matchRoute({ to: '/san-pham', fuzzy: false })
  const isCongTrinh = !!matchRoute({ to: '/cong-trinh-thi-cong', fuzzy: false })

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="px-4 py-3 font-semibold">ONT Admin</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/san-pham" search={{ category: 'all' }} />}
                    isActive={isSanPham}
                  >
                    <Package className="size-4" />
                    <span>Sản phẩm</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/cong-trinh-thi-cong" search={{ category: 'all' }} />}
                    isActive={isCongTrinh}
                  >
                    <HardHat className="size-4" />
                    <span>Công trình thi công</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
    </SidebarProvider>
  )
}
