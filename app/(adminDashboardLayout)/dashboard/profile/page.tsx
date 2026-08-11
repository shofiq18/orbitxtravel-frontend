"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { User, Mail, Shield, CheckCircle, Globe, ShieldAlert, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DashboardProfilePage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is logged in
  if (!user) {
    toast.error("Access Denied: Please log in first.");
    router.push("/login");
    return null;
  }

  // Helper to format role names cleanly in UI
  const formatRole = (roleStr: string | undefined) => {
    if (!roleStr) return "";
    return roleStr.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">My Account Profile</h1>
        <p className="text-sm text-text-light mt-1">Manage and view your credentials, active mode, and authorization details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card Column */}
        <div className="bg-bg-primary border border-border-custom p-6 space-y-6 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-theme-primary/10 flex items-center justify-center text-theme-primary border border-theme-primary/20">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{user.fullName}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 mt-1 text-white bg-theme-primary">
                {formatRole(user.currentRole || "traveler")}
              </span>
            </div>
          </div>

          <div className="border-t border-border-custom pt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-text-light font-medium">Account Status</span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-text-light font-medium">Email Address</span>
              <span className="text-text-primary truncate max-w-[150px] font-semibold">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Roles & Identity Column */}
        <div className="lg:col-span-2 bg-bg-primary border border-border-custom p-6 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-text-primary border-b border-border-custom pb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-theme-primary" />
            <span>Identity & Access Permissions</span>
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">Assigned Workspace Roles</h4>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role: string) => (
                  <span
                    key={role}
                    className={`text-xs px-3 py-1.5 border font-semibold ${
                      user.currentRole === role
                        ? "bg-theme-primary/10 border-theme-primary text-theme-primary font-bold"
                        : "bg-bg-secondary border-border-custom text-text-secondary"
                    }`}
                  >
                    {formatRole(role)} {user.currentRole === role && "(Active)"}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">Security Note</h4>
              <p className="text-xs text-text-light leading-relaxed">
                As a host (Hotel Manager, Tour Organizer, or Portal Admin), your credentials grant access to backend inventory constructor tools. Keep your workspace secure and always sign out after completing work sessions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
