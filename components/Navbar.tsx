"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout, updateActiveRole } from "@/feature/user/userSlice";
import { useSwitchRoleMutation } from "@/redux/api/auth/authApi";
import { Menu, X, User, LogOut, LayoutDashboard, Compass, Globe, ChevronDown, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { user } = useSelector((state: RootState) => state.user);
  const avatarUrl = user?.profileImage || user?.avatar || user?.image || undefined;
  const [switchRoleApi] = useSwitchRoleMutation();

  // Vendor role detection
  const vendorRole = user?.roles?.find((r) => ["hotel_owner", "tour_organizer", "admin"].includes(r)) ||
    (["hotel_owner", "tour_organizer", "admin"].includes(user?.role || "") ? user?.role : null) ||
    (["hotel_owner", "tour_organizer", "admin"].includes(user?.currentRole || "") ? user?.currentRole : null);

  const isVendor = Boolean(vendorRole);
  const activeRole = user?.currentRole || user?.role || "traveler";

  const getRoleDisplayName = (rName?: string | null) => {
    if (rName === "hotel_owner") return "Hotel Owner";
    if (rName === "tour_organizer") return "Tour Organizer";
    if (rName === "admin") return "Admin";
    return "Host";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down past 80px, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const handleSwitchRole = async (targetRole: string) => {
    if (!user) return;
    try {
      await switchRoleApi({ role: targetRole }).unwrap();
      dispatch(updateActiveRole(targetRole));
      toast.success(`Switched active workspace to ${getRoleDisplayName(targetRole).toUpperCase()}`);

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

  const getNavClasses = () => {
    const baseClasses = "z-50 w-full transition-transform duration-300 ease-in-out";
    const visibilityClass = isVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full";

    if (!isScrolled) {
      if (isHomePage) {
        return `${baseClasses} absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent ${visibilityClass}`;
      }
      return `${baseClasses} relative bg-[#0B0F19] text-white border-b border-gray-800/80 shadow-md ${visibilityClass}`;
    }

    return `${baseClasses} fixed top-0 left-0 right-0 bg-black text-white border-b border-gray-800/80 shadow-xl ${visibilityClass}`;
  };

  return (
    <nav className={getNavClasses()}>
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight group">
          <Globe className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
          <span className="font-extrabold tracking-wide">OrbitX Travel</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-9 text-sm font-semibold text-white/90">
          <Link href="/" className="hover:text-white transition-colors py-1">
            Home
          </Link>
          <Link href="/tours" className="hover:text-white transition-colors py-1">
            Tours
          </Link>
          <Link href="/hotels" className="hover:text-white transition-colors py-1">
            Stays & Hotels
          </Link>
          <Link href="/about" className="hover:text-white transition-colors py-1">
            About Us
          </Link>
        </div>

        {/* Right Action Stack */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* Become a Host or Role Switcher Button */}
          {!isVendor ? (
            <Link
              href="/become-host"
              className="text-xs sm:text-sm font-bold text-white bg-[#0061AA] hover:bg-[#004b85] transition-all px-4.5 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              Become a Host
            </Link>
          ) : (
            <button
              onClick={() => {
                if (activeRole !== "traveler") {
                  handleSwitchRole("traveler");
                } else {
                  handleSwitchRole(vendorRole || "hotel_owner");
                }
              }}
              className={`text-xs sm:text-sm font-bold transition-all px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                activeRole !== "traveler"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border border-white/20"
                  : "bg-[#0061AA] hover:bg-[#004b85] text-white"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              <span>
                {activeRole !== "traveler"
                  ? "Switch to Traveler"
                  : `Switch to ${getRoleDisplayName(vendorRole)}`}
              </span>
            </button>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              {/* User Profile Avatar Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1.5 p-0.5 rounded-full text-white hover:opacity-90 transition-all cursor-pointer">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.fullName || user.name || "User"}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shadow-md hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md">
                      <User className="h-4.5 w-4.5 text-white shrink-0" />
                    </div>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-white/80 shrink-0 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                <div className="absolute right-0 top-full pt-2 z-50 hidden group-hover:block hover:block w-60">
                  <div className="bg-slate-900/95 backdrop-blur-2xl text-white shadow-2xl py-2 rounded-2xl border border-white/10">
                    <div className="px-4 py-2.5 border-b border-white/10 flex items-center space-x-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.fullName || user.name || "User"}
                          className="h-9 w-9 rounded-full object-cover border border-white/30 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-300 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Dashboard or Profile Link */}
                      {activeRole && ["admin", "hotel_owner", "tour_organizer"].includes(activeRole) ? (
                        <Link
                          href={
                            activeRole === "hotel_owner"
                              ? "/dashboard/hotel-owner"
                              : activeRole === "tour_organizer"
                              ? "/dashboard/tour-organizer"
                              : "/dashboard/admin"
                          }
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors font-semibold"
                        >
                          <LayoutDashboard className="h-4 w-4 text-amber-400" />
                          <span>Dashboard ({getRoleDisplayName(activeRole)})</span>
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors font-semibold"
                        >
                          <UserCheck className="h-4 w-4 text-amber-400" />
                          <span>My Profile (Traveler)</span>
                        </Link>
                      )}

                      {/* Dropdown Role Switcher Option for Vendors */}
                      {isVendor && (
                        <button
                          onClick={() => {
                            if (activeRole !== "traveler") {
                              handleSwitchRole("traveler");
                            } else {
                              handleSwitchRole(vendorRole || "hotel_owner");
                            }
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-[#38bdf8] hover:bg-white/10 transition-colors font-semibold text-left cursor-pointer border-t border-white/5 mt-1 pt-2"
                        >
                          <RefreshCw className="h-4 w-4 shrink-0" />
                          <span>
                            {activeRole !== "traveler"
                              ? "Switch to Traveler View"
                              : `Switch to ${getRoleDisplayName(vendorRole)} View`}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                href="/login"
                className="text-sm font-bold text-white hover:text-amber-300 transition-colors px-2 py-1"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 rounded-full bg-white/10 backdrop-blur-md cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-slate-950/95 backdrop-blur-2xl text-white py-6 px-6 space-y-4 z-50">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-1"
          >
            Home
          </Link>
          <Link
            href="/tours"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-1"
          >
            Tours
          </Link>
          <Link
            href="/hotels"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-1"
          >
            Stays & Hotels
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-1"
          >
            About Us
          </Link>

          {/* Role Switcher or Become Host in Mobile Menu */}
          {user && isVendor ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (activeRole !== "traveler") {
                  handleSwitchRole("traveler");
                } else {
                  handleSwitchRole(vendorRole || "hotel_owner");
                }
              }}
              className="w-full text-left flex items-center space-x-2 text-sm font-bold text-[#38bdf8] py-2 border-t border-white/10 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>
                {activeRole !== "traveler"
                  ? "Switch to Traveler View"
                  : `Switch to ${getRoleDisplayName(vendorRole)} View`}
              </span>
            </button>
          ) : !isVendor ? (
            <Link
              href="/become-host"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-bold text-[#38bdf8] py-2 border-t border-white/10"
            >
              Become a Host
            </Link>
          ) : null}

          {user ? (
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center space-x-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.fullName || "User"}
                    className="w-9 h-9 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{user.fullName}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                </div>
              </div>

              {activeRole && ["admin", "hotel_owner", "tour_organizer"].includes(activeRole) && (
                <Link
                  href={
                    activeRole === "hotel_owner"
                      ? "/dashboard/hotel-owner"
                      : activeRole === "tour_organizer"
                      ? "/dashboard/tour-organizer"
                      : "/dashboard/admin"
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xs font-bold text-amber-400 hover:underline py-1"
                >
                  Go to {getRoleDisplayName(activeRole)} Dashboard →
                </Link>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-xs font-bold text-red-400 py-1 flex items-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-white/10 pt-4 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-white py-2.5 rounded-xl bg-white/10"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
