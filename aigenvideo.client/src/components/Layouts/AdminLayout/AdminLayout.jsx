import { AppSidebar } from '@/components/NavBar';
import { BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { Home, Map, Receipt, Settings, Users } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

const items = [
  {
    title: 'Home',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'Manager Users',
    url: '/admin/user-manager',
    icon: Users,
  },
  {
    title: 'Payment Manager',
    url: '/admin/payment-manager',
    icon: Receipt,
  },
  {
    title: 'Search',
    url: '/admin/search',
    icon: Map,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const isActive = (url) => {
    return location.pathname === url;
  };

  const getHeaderTitle = () => {
    const activeItem = items.find((item) => isActive(item.url));
    return `${activeItem ? activeItem.title : ''} Page`;
  };

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg font-semibold text-foreground ml-4">{getHeaderTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
