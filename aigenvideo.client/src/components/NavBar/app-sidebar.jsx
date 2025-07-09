import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  Monitor,
  Moon,
  PieChart,
  Receipt,
  Settings,
  Settings2,
  SquareTerminal,
  Sun,
  User,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/NavBar/nav-main';
import { NavProjects } from '@/components/NavBar/nav-projects';
import { NavUser } from '@/components/NavBar/nav-user';
import { TeamSwitcher } from '@/components/NavBar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

// This is sample data.
const data = {
  modes: [
    {
      name: 'System',
      logo: Monitor,
    },
    {
      name: 'Dark Mode',
      logo: Moon,
    },
    {
      name: 'Light Mode',
      logo: Sun,
    },
  ],
  navMain: [
    {
      title: 'User',
      url: 'admin/user-manager',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Manager users',
          url: '/admin/user-manager',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '/admin/user-manager',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

export function AppSidebar({ items, ...props }) {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.modes} />
      </SidebarHeader>
      <Separator className="mt-1 -mb-1" />
      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu className="mb-4 mt-6 space-y-1 px-2">
            {items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <SidebarMenuItem
                  key={item.title}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg transition-colors group',
                        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="ml-3 text-sm font-medium sidebar-item-text transition-all duration-300">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <Separator />

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
