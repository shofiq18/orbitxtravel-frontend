"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetUsersQuery, useSuspendUserMutation } from "@/redux/api/admin/adminApi";
import { Loader2, Search, ShieldAlert, CheckCircle2, User, UserX, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else if (currentUser.currentRole !== "admin") {
      toast.error("Access Denied: Admin privileges required.");
      router.push("/");
    }
  }, [currentUser, router]);

  // API Queries & Mutations
  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery(undefined);
  const users = usersResponse?.data || [];
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleToggleSuspend = async (userId: string, currentSuspendedStatus: boolean) => {
    const targetStatus = !currentSuspendedStatus;
    try {
      const res = await suspendUser({
        userId,
        body: { isSuspended: targetStatus },
      }).unwrap();
      toast.success(res?.message || `User successfully ${targetStatus ? "suspended" : "unsuspended"}.`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update suspension status.");
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "suspended" && u.isSuspended) ||
      (statusFilter === "active" && !u.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">User Account Management</h1>
        <p className="text-sm text-text-light mt-1">Monitor all platform accounts, audit details, and toggle account suspensions.</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-theme-primary/10 text-theme-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Total Accounts</p>
            <p className="text-xl font-bold text-text-primary mt-1">{users.length}</p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-green-50 text-green-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Active Users</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {users.filter((u: any) => !u.isSuspended).length}
            </p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-red-50 text-red-600">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Suspended Users</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {users.filter((u: any) => u.isSuspended).length}
            </p>
          </div>
        </div>
      </div>

      {/* Table & Controls Section */}
      <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
        
        {/* Filter Controls Stack */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search bar */}
          <div className="flex items-center space-x-2 bg-bg-secondary border border-border-custom px-3 py-2 text-text-secondary w-full md:max-w-xs rounded-none">
            <Search className="h-4 w-4 text-text-light" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-xs w-full text-text-primary font-semibold"
            />
          </div>

          {/* Selector filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-bg-secondary border border-border-custom text-xs font-bold px-3 py-2 text-text-secondary outline-none focus:border-theme-primary cursor-pointer rounded-none"
              >
                <option value="all">All Roles</option>
                <option value="traveler">Traveler</option>
                <option value="hotel_owner">Hotel Owner</option>
                <option value="tour_organizer">Tour Organizer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-bg-secondary border border-border-custom text-xs font-bold px-3 py-2 text-text-secondary outline-none focus:border-theme-primary cursor-pointer rounded-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-theme-primary" />
            <span className="font-semibold text-sm">Retrieving users registry...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-none">
            No registered users found matching the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold text-text-secondary border border-border-custom">
              <thead>
                <tr className="border-b border-border-custom bg-bg-secondary text-text-primary text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 border-r border-border-custom">User Profile</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Email</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Primary Roles</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Verification Status</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Security Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom bg-bg-primary">
                {filteredUsers.map((item: any) => (
                  <tr key={item.id} className="hover:bg-bg-secondary/35 transition-colors">
                    <td className="py-3.5 px-4 border-r border-border-custom font-bold text-text-primary">
                      {item.fullName}
                      {item.id === currentUser?.id && (
                        <span className="ml-1.5 bg-gray-100 text-gray-700 text-[8px] font-bold px-1.5 py-0.5 rounded-none uppercase">You</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 border-r border-border-custom font-mono select-all text-text-secondary">{item.email}</td>
                    <td className="py-3.5 px-4 border-r border-border-custom">
                      <div className="flex flex-wrap gap-1">
                        {item.roles.map((r: string) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-none tracking-wide ${
                              r === "admin"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : r === "hotel_owner"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : r === "tour_organizer"
                                ? "bg-teal-50 text-teal-600 border border-teal-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {r.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 border-r border-border-custom">
                      {item.isVerified ? (
                        <span className="text-green-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Host Verified</span>
                        </span>
                      ) : (
                        <span className="text-text-light font-bold">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 border-r border-border-custom">
                      {item.isSuspended ? (
                        <span className="text-red-600 font-bold flex items-center space-x-1">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.id === currentUser?.id ? (
                        <span className="text-text-light italic text-[10px]">Restricted</span>
                      ) : (
                        <button
                          onClick={() => handleToggleSuspend(item.id, item.isSuspended)}
                          disabled={isSuspending}
                          className={`px-3 py-1.5 text-[10px] font-bold transition rounded-none cursor-pointer ${
                            item.isSuspended
                              ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          {item.isSuspended ? "Unsuspend Access" : "Suspend Account"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
