import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  title: string;
  onMenuToggle: () => void;
};

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    if (user.role === 'admin') {
      setLocation('/admin/profile');
    } else if (user.role === 'store_owner') {
      setLocation('/store-owner/profile');
    } else {
      setLocation('/user/profile');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden mr-2"
          >
            <span className="material-icons">menu</span>
          </Button>
          <h1 className="text-xl font-medium text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center">
          <div className="relative mr-4">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 h-9"
            />
            <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
          </div>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center focus:outline-none"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium hidden md:block">
                  {user.name}
                </span>
                <span className="material-icons ml-1">arrow_drop_down</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" ref={dropdownRef}>
              <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
