import { Link, Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
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
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
