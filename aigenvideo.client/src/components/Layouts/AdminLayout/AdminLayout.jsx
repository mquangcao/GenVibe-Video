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

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
