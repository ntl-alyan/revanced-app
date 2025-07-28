import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Laptop,
  LayoutDashboard,
  FileText,
  File,
  Home,
  Tag,
  Image,
  User,
  Settings,
  Package,
  ExternalLink,
  Globe,
  Link2,
  Code
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme-provider";

type SidebarProps = {
  className?: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItemProps = {
  icon: React.ReactNode;
  href: string;
  label: string;
  onClick?: () => void;
};

function NavItem({ icon, href, label, onClick }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href || location.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary hover:bg-opacity-10 hover:text-primary rounded-md transition-colors",
        isActive && "text-primary bg-primary bg-opacity-10"
      )}
    >
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        {label}
      </div>
    </Link>
  );
}

export function Sidebar({ className, isMobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full overflow-y-auto z-10 transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link href="/admin" className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
          <Laptop className="h-8 w-8 text-primary" />
          <span>AdminPanel</span>
        </Link>
        <button 
          className="lg:hidden text-gray-500 focus:outline-none"
          onClick={onCloseMobile}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="px-4 py-2">
        <NavItem 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          href="/admin" 
          label="Dashboard" 
          onClick={onCloseMobile}
        />
        
        <div className="mt-4">
          <div className="px-4 py-2 flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">Content</span>
          </div>
          
          <NavItem 
            icon={<FileText className="h-5 w-5" />} 
            href="/admin/posts" 
            label="Posts" 
            onClick={onCloseMobile}
          />
          
          <NavItem 
            icon={<File className="h-5 w-5" />} 
            href="/admin/pages" 
            label="Pages" 
            onClick={onCloseMobile}
          />
          
          <NavItem 
            icon={<Home className="h-5 w-5" />} 
            href="/admin/homepage" 
            label="Homepage" 
            onClick={onCloseMobile}
          />
          
          <NavItem 
            icon={<Tag className="h-5 w-5" />} 
            href="/admin/categories" 
            label="Categories" 
            onClick={onCloseMobile}
          />
        </div>
        
        <div className="mt-4">
          <NavItem 
            icon={<Image className="h-5 w-5" />} 
            href="/admin/media" 
            label="Media" 
            onClick={onCloseMobile}
          />
        </div>
        
        <div className="mt-4">
          <NavItem 
            icon={<Package className="h-5 w-5" />} 
            href="/admin/apps" 
            label="Apps" 
            onClick={onCloseMobile}
          />
        </div>
        
        <div className="mt-4">
          <div className="px-4 py-2 flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">SEO</span>
          </div>
          
          <NavItem 
            icon={<Link2 className="h-5 w-5" />} 
            href="/admin/redirects" 
            label="URL Redirects" 
            onClick={onCloseMobile}
          />
          
          <NavItem 
            icon={<Globe className="h-5 w-5" />} 
            href="/admin/sitemap" 
            label="Sitemap" 
            onClick={onCloseMobile}
          />
          
          <NavItem 
            icon={<Code className="h-5 w-5" />} 
            href="/admin/structured-data" 
            label="Structured Data" 
            onClick={onCloseMobile}
          />
        </div>
        
        <div className="mt-4">
          <div className="px-4 py-2 flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">System</span>
          </div>
          
          {user?.role === 'admin' && (
            <NavItem 
              icon={<User className="h-5 w-5" />} 
              href="/admin/users" 
              label="Users" 
              onClick={onCloseMobile}
            />
          )}
          
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            href="/admin/settings" 
            label="Settings" 
            onClick={onCloseMobile}
          />
        </div>
      </div>
      
      <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700 absolute bottom-0 w-full">
        <a 
          href="#" 
          target="_blank" 
          className="flex items-center px-4 py-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-md transition-colors"
          onClick={() => {
            window.open("/", "_blank");
            onCloseMobile();
          }}
        >
          <ExternalLink className="h-5 w-5 mr-3" />
          Visit Website
        </a>
      </div>
    </div>
  );
}
