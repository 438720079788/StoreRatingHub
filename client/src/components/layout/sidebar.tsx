import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function Sidebar({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [navSections, setNavSections] = useState<NavSection[]>([]);

  // Set up navigation sections based on user role
  useEffect(() => {
    if (!user) return;

    const sections: NavSection[] = [];

    if (user.role === 'admin') {
      sections.push({
        title: 'Admin',
        items: [
          { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/admin/users', label: 'Users', icon: 'people' },
          { href: '/admin/stores', label: 'Stores', icon: 'store' },
        ],
      });
    } else if (user.role === 'store_owner') {
      sections.push({
        title: 'Store Owner',
        items: [
          { href: '/store-owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/store-owner/stores', label: 'My Stores', icon: 'store' },
          { href: '/store-owner/profile', label: 'Profile', icon: 'person' },
        ],
      });
    } else if (user.role === 'user') {
      sections.push({
        title: 'User',
        items: [
          { href: '/user/stores', label: 'Stores', icon: 'store' },
          { href: '/user/ratings', label: 'My Ratings', icon: 'star' },
          { href: '/user/profile', label: 'Profile', icon: 'person' },
        ],
      });
    }

    setNavSections(sections);
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <aside 
      className={cn(
        "w-64 bg-primary text-white h-screen overflow-y-auto transition-transform z-10",
        isMobile ? "fixed left-0 top-0" : "fixed left-0 top-0"
      )}
    >
      <div className="p-4 border-b border-primary-light">
        <h1 className="text-xl font-medium">Store Rating Platform</h1>
      </div>

      {navSections.map((section, index) => (
        <div key={index} className="py-4">
          <div className="px-4 mb-3">
            <p className="text-sm text-white/70 uppercase font-medium">{section.title}</p>
          </div>
          {section.items.map((item, itemIndex) => (
            <Link 
              key={itemIndex} 
              href={item.href}
              onClick={handleNavClick}
            >
              <a 
                className={cn(
                  "flex items-center px-4 py-2 text-white",
                  location === item.href ? "bg-primary-light" : "hover:bg-primary-light"
                )}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      ))}

      <div className="p-4 mt-auto border-t border-primary-light">
        <Button
          variant="ghost"
          className="flex items-center text-white hover:text-white/80 w-full justify-start p-0"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </Button>
      </div>
    </aside>
  );
}
