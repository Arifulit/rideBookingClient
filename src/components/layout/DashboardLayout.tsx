import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@/redux/store';
import { logout } from '@/redux/index';
import type { User as UserType } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Home,
  User as UserIcon,
  Settings,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { ModeToggle } from '@/components/theme/ModeToggle';
import { adminSidebarItems } from '@/routes/adminSidebarItems';
import { driverSidebarItems } from '@/routes/driverSidebarItems';
import { userSidebarItems } from '@/routes/userSidebarItems';
import { ISidebarItem } from '@/types';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser) as UserType | null;
  const [sidebarOpen, setSidebarOpen] = useState(false);


 
  // Get sidebar items based on user role
  const getSidebarItems = (): ISidebarItem[] => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return adminSidebarItems;
      case 'driver':
        return driverSidebarItems;
      case 'rider':
        return userSidebarItems;
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

   console.log("Redux user.role:", user?.role);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">RideShare</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActiveRoute(item.url)
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.icon && React.createElement(item.icon, { className: "mr-3 h-4 w-4" })}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile in Sidebar */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage} alt={user?.firstName || 'User'} />
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground">
                  {user?.role === 'admin'
                    ? 'Admin Dashboard'
                    : user?.role === 'driver'
                    ? 'Driver Dashboard'
                    : 'Rider Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ModeToggle />
              
              {/* Search Button */}
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.firstName || 'User'} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Guest'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${user?.role || 'rider'}/profile`} className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;