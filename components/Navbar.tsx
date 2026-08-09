"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout, updateActiveRole } from "@/feature/user/userSlice";
import { useSwitchRoleMutation } from "@/redux/api/auth/authApi";
import { Menu, X, User, LogOut, LayoutDashboard, Compass, Globe, ChevronDown, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.user);
  const [switchRoleApi, { isLoading: isSwitching }] = useSwitchRoleMutation();

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const handleSwitchRole = async (targetRole: string) => {
    if (!user) return;
    try {
      const response = await switchRoleApi({ role: targetRole }).unwrap();
      dispatch(updateActiveRole(targetRole));
      toast.success(`Switched active workspace to ${targetRole.replace("_", " ").toUpperCase()}`);
      setIsRoleSwitcherOpen(false);
      setIsProfileDropdownOpen(false);

      // Redirect based on role
      if (targetRole === "hotel_owner") {
        router.push("/dashboard/hotel-owner");
      } else if (targetRole === "tour_organizer") {
        router.push("/dashboard/tour-organizer");
      } else if (targetRole === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to switch role");
    }
  };

  // Helper to format role names cleanly in UI
  const formatRole = (roleStr: string | undefined) => {
    if (!roleStr) return "";
    return roleStr.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav className="w-full bg-bg-primary border-b border-border-custom sticky top-0 z-50 transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 text-theme-primary font-bold text-2xl tracking-wide">
          <Globe className="h-6 w-6" />
          <span>orbitX Travel</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-secondary">
          <Link
            href="/tours"
            className={`hover:text-theme-primary transition-colors py-2 ${
              pathname === "/tours" ? "text-theme-primary border-b-2 border-theme-primary" : ""
            }`}
          >
            Find Tours
          </Link>
          <Link
            href="/hotels"
            className={`hover:text-theme-primary transition-colors py-2 ${
              pathname === "/hotels" ? "text-theme-primary border-b-2 border-theme-primary" : ""
            }`}
          >
            Find Hotels
          </Link>
          
          {/* Active portal dashboards based on roles */}
          {user?.currentRole === "hotel_owner" && (
            <Link href="/hotel-dashboard" className="text-theme-secondary flex items-center space-x-1 hover:opacity-80">
              <LayoutDashboard className="h-4 w-4" />
              <span>Hotel Manager</span>
            </Link>
          )}
          {user?.currentRole === "tour_organizer" && (
            <Link href="/organizer-dashboard" className="text-theme-secondary flex items-center space-x-1 hover:opacity-80">
              <LayoutDashboard className="h-4 w-4" />
              <span>Tour Organizer</span>
            </Link>
          )}
          {user?.currentRole === "admin" && (
            <Link href="/admin-dashboard" className="text-theme-accent flex items-center space-x-1 hover:opacity-80">
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Console</span>
            </Link>
          )}
        </div>

        {/* Right Action Stack */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              
              {/* Role Toggle Switcher */}
              {user.roles && user.roles.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                    disabled={isSwitching}
                    className="flex items-center space-x-1 bg-btn-secondary text-btn-text-secondary px-3 py-1.5 text-xs font-semibold border border-border-custom hover:bg-opacity-80 transition-all rounded-none cursor-pointer"
                  >
                    <span>Mode: {formatRole(user.currentRole)}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {isRoleSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-primary border border-border-custom shadow-lg py-1 z-50 rounded-none animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="px-3 py-1.5 text-xs text-text-light font-bold border-b border-border-custom">
                        Switch Mode
                      </div>
                      {user.roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleSwitchRole(r)}
                          disabled={user.currentRole === r}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-secondary transition-colors block ${
                            user.currentRole === r ? "text-theme-primary font-bold bg-bg-secondary" : "text-text-secondary"
                          }`}
                        >
                          {formatRole(r)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Become a Host CTA if traveler-only */}
              {user.roles && user.roles.length === 1 && user.roles.includes("traveler") && (
                <Link
                  href="/become-host"
                  className="bg-theme-secondary text-text-white text-xs font-semibold px-4 py-2 border border-transparent hover:opacity-90 transition-all rounded-none"
                >
                  Become a Host
                </Link>
              )}

              {/* User Avatar Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 border border-border-custom px-3 py-1.5 bg-bg-secondary hover:bg-opacity-80 transition-colors rounded-none cursor-pointer"
                >
                  <User className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">{user.fullName}</span>
                  <ChevronDown className="h-3 w-3 text-text-secondary" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-bg-primary border border-border-custom shadow-xl py-2 z-50 rounded-none animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border-custom">
                      <p className="text-sm font-bold text-text-primary">{user.fullName}</p>
                      <p className="text-xs text-text-light truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      {user.roles?.includes("traveler") && user.currentRole !== "traveler" && (
                        <button
                          onClick={() => handleSwitchRole("traveler")}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                        >
                          <Compass className="h-4 w-4" />
                          <span>Switch to Traveler</span>
                        </button>
                      )}
                    </div>
                    <div className="border-t border-border-custom pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:bg-opacity-50 transition-colors font-medium text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-bold text-text-primary hover:text-theme-primary px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="bg-btn-primary text-btn-text-primary text-sm font-bold px-5 py-2 border border-transparent hover:opacity-90 transition-all rounded-none"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-primary hover:text-theme-primary p-2 border border-border-custom rounded-none bg-bg-secondary cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-bg-primary border-t border-border-custom py-4 px-4 space-y-3 z-40 relative animate-in fade-in slide-in-from-top-3 duration-200">
          <Link
            href="/tours"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-text-secondary hover:text-theme-primary py-2"
          >
            Find Tours
          </Link>
          <Link
            href="/hotels"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-text-secondary hover:text-theme-primary py-2"
          >
            Find Hotels
          </Link>

          {user && (
            <div className="border-t border-border-custom pt-3 space-y-2">
              <div className="text-xs text-text-light font-bold py-1">
                Workspace Dashboard
              </div>
              {user.currentRole === "hotel_owner" && (
                <Link
                  href="/dashboard/hotel-owner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-theme-secondary py-1"
                >
                  Hotel Manager Dashboard
                </Link>
              )}
              {user.currentRole === "tour_organizer" && (
                <Link
                  href="/dashboard/tour-organizer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-theme-secondary py-1"
                >
                  Tour Organizer Dashboard
                </Link>
              )}
              {user.currentRole === "admin" && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-theme-accent py-1"
                >
                  Admin Console
                </Link>
              )}

              {user.roles && user.roles.length > 1 && (
                <div className="py-2">
                  <p className="text-xs text-text-light font-bold mb-1">Switch User Role</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {user.roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          handleSwitchRole(r);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-xs px-3 py-1.5 border border-border-custom font-semibold rounded-none ${
                          user.currentRole === r
                            ? "bg-theme-primary text-text-white"
                            : "bg-bg-secondary text-text-secondary"
                        }`}
                      >
                        {formatRole(r)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user.roles && user.roles.length === 1 && user.roles.includes("traveler") && (
                <Link
                  href="/become-host"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center bg-theme-secondary text-text-white text-xs font-bold py-2 rounded-none"
                >
                  Become a Host
                </Link>
              )}

              <div className="border-t border-border-custom pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">{user.fullName}</p>
                  <p className="text-xs text-text-light">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 border border-red-200 px-3 py-2 bg-red-50 bg-opacity-20 hover:bg-opacity-40 transition-colors rounded-none"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="border-t border-border-custom pt-4 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-text-primary py-2 border border-border-custom rounded-none bg-bg-secondary"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-btn-text-primary py-2 bg-btn-primary rounded-none"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
