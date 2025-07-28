import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell, Sun, Moon, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";



export function Topbar({ onMobileMenuToggle }) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setNotificationsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.username;
  
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="lg:hidden mr-4 text-gray-500 dark:text-gray-400 focus:outline-none" 
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-xl font-semibold lg:hidden">AdminPanel</div>
          <div className="ml-4 relative lg:block hidden">
            <input 
              type="text" 
              className="rounded-md pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 w-72 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-opacity-50 dark:text-white" 
              placeholder="Search..."
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="flex items-center cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsMenuRef}>
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {notificationsMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-20">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <a href="#" className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-200">New comment on your post "Getting Started with CorePHP"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-200">Your post "MySQL Performance Tips" is now published</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </a>
                </div>
                <a href="#" className="block text-center text-sm text-primary hover:underline py-2 border-t border-gray-200 dark:border-gray-700">
                  View all notifications
                </a>
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              className="flex items-center text-gray-700 dark:text-gray-200 focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <span className="mr-2 hidden md:block">{displayName}</span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(displayName || '')}
                </AvatarFallback>
              </Avatar>
            </button>
            
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-20">
                <Link href="/admin/settings/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Your Profile
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Settings
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
