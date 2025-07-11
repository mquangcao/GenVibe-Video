'use client';

import { useState } from 'react';
import { Link, Links, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Home, Crown, Mic, ImageIcon, Video, Settings, LogOut, User, ChevronDown, Sparkles, Zap, Menu, X, Archive } from 'lucide-react';
import { useAuth } from '@/hooks';
import { logout as logoutAccount } from '@/apis';
import { clearAuthTokens } from '@/utils';
import { logout } from '@/redux';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Upgrade Pro',
    href: '/pricing',
    icon: Crown,
    badge: 'Pro',
    gradient: true,
  },
  {
    title: 'Voice AI',
    href: '/voice-generate',
    icon: Mic,
  },
  {
    title: 'Image AI',
    href: '/image-generate',
    icon: ImageIcon,
  },
  {
    title: 'Video AI',
    href: '/video-generate',
    icon: Video,
  },
  {
    title: 'My Videos',
    href: '/my-videos',
    icon: Archive,
  },
];

// Mock user data
// const user = {
//   name: 'Alex Johnson',
//   email: 'alex@example.com',
//   avatar: '/placeholder.svg?height=40&width=40',
//   plan: 'Pro',
//   credits: 2450,
// };

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAuthenticated, authDispatch } = useAuth();
  const navigate = useNavigate();

  console.log(user);

  const handleSignOut = async () => {
    try {
      const response = await logoutAccount();
      if (response.data.success) {
        console.log('Logout successful');
      } else {
        console.error('Logout failed:', response.data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthTokens();
      authDispatch(logout());
    }

    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-300 relative',
          isCollapsed ? 'w-20' : 'w-72',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'fixed lg:relative z-40 h-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="relative">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
                AI Studio
              </h1>
              <p className="text-xs text-gray-500 font-medium">Creative Platform</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 text-violet-700 shadow-lg border border-violet-200/50'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md',
                      isCollapsed && 'justify-center px-2',
                      item.gradient && !isActive && 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-violet-600', item.gradient && 'text-orange-500')} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold shadow-lg">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Credits Display */}
        </nav>

        {/* User Account Section */}
        {isAuthenticated ? (
          <div className="p-4 border-t border-white/10">
            {isCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full p-2 rounded-xl hover:bg-white/50">
                    <Avatar className="w-8 h-8 ring-2 ring-violet-200">
                      <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl border-white/20">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-violet-50">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-violet-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full p-3 h-auto rounded-xl hover:bg-white/50 transition-all duration-200">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-11 h-11 ring-2 ring-violet-200 shadow-lg">
                        <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <Badge className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white border-none shadow-sm">
                            {user.role === 'vip' ? 'Pro' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                  <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-violet-50 transition-colors">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-violet-50 transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    <Link to="/account/platform-connections">Platform Connections</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-50 transition-colors">
                    <Crown className="w-4 h-4 mr-2 text-orange-500" />
                    Manage Subscription
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 hover:bg-red-50 transition-colors" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200 hidden lg:flex"
            >
              <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-4">
            <span className="text-gray-500">
              Please{' '}
              <Link to="/login" className="font-medium text-gray-900 hover:underline">
                log in
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
    </>
  );
}
