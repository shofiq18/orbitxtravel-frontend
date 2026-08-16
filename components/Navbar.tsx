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

  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.user);
  const [switchRoleApi] = useSwitchRoleMutation();

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
      toast.success(`Switched active workspace to ${targetRole.replace("_", " ").toUpperCase()}`);

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

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 w-full bg-gradient-to-b from-black/70 via-black/30 to-transparent transition-all">
      <div className="w-full mx-auto px-8 lg:px-16 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name (No background behind logo icon) */}
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

        {/* Right Action Stack (Only Sign In link with NO background, NO SignUp button) */}
        <div className="hidden md:flex items-center space-x-5">
          {user ? (
            <div className="flex items-center space-x-4">
              {/* User Profile Pill */}
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold">{user.fullName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </button>

                <div className="absolute right-0 top-full pt-2 z-50 hidden group-hover:block hover:block w-56">
                  <div className="bg-slate-900/95 backdrop-blur-2xl text-white shadow-2xl py-2 rounded-2xl border-none">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-sm font-bold text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-300 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {user.currentRole && ["admin", "hotel_owner", "tour_organizer"].includes(user.currentRole) ? (
                        <Link
                          href={
                            user.currentRole === "hotel_owner"
                              ? "/dashboard/hotel-owner"
                              : user.currentRole === "tour_organizer"
                              ? "/dashboard/tour-organizer"
                              : "/dashboard/admin"
                          }
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors font-semibold"
                        >
                          <LayoutDashboard className="h-4 w-4 text-amber-400" />
                          <span>Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors font-semibold"
                        >
                          <UserCheck className="h-4 w-4 text-amber-400" />
                          <span>My Profile</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-left"
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

          {!user && (
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
