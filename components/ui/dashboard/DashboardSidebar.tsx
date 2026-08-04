











"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers2,
  Table,
  UserCheck,
  Percent,
  Landmark,
  BellRing,
  Home,
  Bed,
  Calendar,
  Compass,
  Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/feature/user/userSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  
  const getMenuItems = () => {
    const role = user?.currentRole || (user?.roles && user?.roles[0]) || "traveler";
    if (role === "admin") {
      return [
        { title: "Vendor Onboarding", icon: UserCheck, href: "/dashboard/admin" },
        { title: "Commissions Ledger", icon: Percent, href: "/dashboard/admin/commissions" },
        { title: "Payout Authorization", icon: Landmark, href: "/dashboard/admin/payouts" },
        { title: "Automation Trigger", icon: BellRing, href: "/dashboard/admin/alerts" },
        { title: "Back to Portal", icon: Layers2, href: "/" }
      ];
    } else if (role === "hotel_owner") {
      return [
        { title: "Property Overview", icon: Home, href: "/dashboard/hotel-owner" },
        { title: "Room Inventory", icon: Bed, href: "/dashboard/hotel-owner/rooms" },
        { title: "Availability Calendar", icon: Calendar, href: "/dashboard/hotel-owner/calendar" },
        { title: "Back to Portal", icon: Layers2, href: "/" }
      ];
    } else if (role === "tour_organizer") {
      return [
        { title: "Tour Constructor", icon: Compass, href: "/dashboard/tour-organizer" },
        { title: "Lock B2B Rooms", icon: Hotel, href: "/dashboard/tour-organizer/b2b-rooms" },
        { title: "Back to Portal", icon: Layers2, href: "/" }
      ];
    }
    return [{ title: "Back to Portal", icon: Layers2, href: "/" }];
  };

  const activeMenuItems = getMenuItems();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    window.location.href = "/login";
  };

  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/icon/dashboard-logo.png"
              alt="Logo"
              width={139}
              height={50}
              className="w-auto"
            />
          </Link>
        )}
        {/* Desktop toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-9 w-9 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden h-9 w-9 ml-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {activeMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#006CF9]/20 text-[#006CF9] shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    collapsed && "lg:justify-center"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "text-[#006CF9]"
                    )}
                  />
                  {/* Always show label on mobile; hide when collapsed on desktop */}
                  <span className={cn("text-base", collapsed && "lg:hidden")}>
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center cursor-pointer gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-600 hover:bg-red-50",
            collapsed && "lg:justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className={cn("text-base", collapsed && "lg:hidden")}>
            Log out
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger — top-left, only on <lg */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-1 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:bg-gray-50 transition"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-lg transition-all duration-300",
          // Desktop: collapses to icon-only width
          "lg:relative lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          // Mobile: full width drawer, slides in/out
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}