import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";



export function MainLayout({ children }) {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsSidebarMobileOpen(!isSidebarMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsSidebarMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        isMobileOpen={isSidebarMobileOpen} 
        onCloseMobile={closeMobileMenu}
      />
      
      <div className="lg:ml-64 flex-1 flex flex-col">
        <Topbar onMobileMenuToggle={toggleMobileMenu} />
        
        <main className="p-6 flex-1 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
