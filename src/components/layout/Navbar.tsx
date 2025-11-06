
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { ModeToggle } from '@/components/theme/ModeToggle';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock user data (replace with your authentication state)
  const isAuthenticated = false;
  const user = { name: 'John Doe', role: 'rider' };

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/');
  };

  const publicNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Car className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold gradient-text">RideBook Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                {publicNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-accent ${
                      isActive(item.path)
                        ? 'text-primary bg-accent'
                        : 'text-foreground hover:text-foreground/80'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname.includes('dashboard')
                      ? 'text-primary bg-accent'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  Dashboard
                </Link>

                {user?.role === 'rider' && (
                  <Link
                    to="/rider/rides"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname.includes('/rider/rides')
                        ? 'text-primary bg-accent'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    My Rides
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side (Auth Buttons / Dropdown) */}
          <div className="hidden md:flex items-center space-x-3">
            <ModeToggle variant="ghost" size="sm" />

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn-secondary px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span>{user?.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
                    <Link
                      to={`/${user?.role}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to={`/${user?.role}/settings`}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle variant="ghost" size="sm" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-slide-in">
            <div className="px-4 py-3 space-y-1">
              {!isAuthenticated ? (
                <>
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`block px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'text-primary bg-accent'
                          : 'text-foreground hover:bg-accent'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="btn-secondary block px-3 py-2 text-base font-medium rounded-lg text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary block px-3 py-2 text-base font-medium rounded-lg text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={`/${user?.role}/profile`}
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
