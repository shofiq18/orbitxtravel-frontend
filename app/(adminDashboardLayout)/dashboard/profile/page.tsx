"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetBookingsByUserQuery } from "@/redux/api/booking/bookingApi";
import { useUpdateProfileMutation, useUploadFileMutation } from "@/redux/api/auth/authApi";
import { updateUserInfo } from "@/feature/user/userSlice";
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileDown, 
  Calendar, 
  ShoppingBag, 
  Loader2, 
  KeyRound, 
  Lock, 
  ArrowRight,
  Camera,
  Save,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DashboardProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const isHostOrAdmin = Boolean(user && (user.currentRole === "admin" || user.currentRole === "tour_organizer" || user.currentRole === "hotel_owner"));

  // Profile Edit states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.businessProfile?.avatarUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // API Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadFile] = useUploadFileMutation();

  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookingsByUserQuery(undefined, {
    skip: !user || isHostOrAdmin,
  });
  const myBookings = bookingsResponse?.data || [];

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

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

  const getAbsoluteVoucherUrl = (relativeUrl: string) => {
    if (!relativeUrl) return "#";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const domainBase = apiBase.replace("/api/v1", "");
    return `${domainBase}${relativeUrl}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    toast.loading("Uploading avatar image...", { id: "up-avatar" });

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadFile({ file: reader.result as string }).unwrap();
        if (res?.success && res?.data) {
          setAvatarUrl(res.data);
          toast.success("Avatar image uploaded!", { id: "up-avatar" });
        }
      } catch (err: any) {
        toast.error("Failed to upload avatar image.", { id: "up-avatar" });
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    try {
      toast.loading("Saving profile updates...", { id: "up-profile" });
      
      const payload: any = {
        fullName: fullName.trim(),
      };

      if (avatarUrl) {
        payload.businessProfile = {
          ...(user.businessProfile || {}),
          avatarUrl,
        };
      }

      const res = await updateProfile(payload).unwrap();
      
      if (res?.data) {
        dispatch(updateUserInfo(res.data));
      }

      toast.success(res?.message || "Profile updated successfully!", { id: "up-profile" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile.", { id: "up-profile" });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill out all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      toast.loading("Updating security credentials...", { id: "chg-pwd" });

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiBase}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update password.");
      }

      toast.success("Password changed successfully!", { id: "chg-pwd" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password.", { id: "chg-pwd" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">My Account & Profile</h1>
        <p className="text-sm text-text-light mt-1">Manage your credentials, update your profile picture, and change password.</p>
      </div>

      <div className={`grid grid-cols-1 ${isHostOrAdmin ? "max-w-4xl" : "lg:grid-cols-3"} gap-8`}>
        
        {/* Profile & Security Section */}
        <div className={`space-y-6 ${isHostOrAdmin ? "w-full" : ""}`}>
          
          {/* Profile Avatar Card */}
          <div className="bg-bg-primary border border-border-custom p-6 space-y-6 rounded-2xl shadow-xs">
            <div className="flex flex-col items-center text-center space-y-3">
              
              {/* Avatar Upload Container */}
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="user-avatar-file-upload"
                />
                <label htmlFor="user-avatar-file-upload" className="cursor-pointer block relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-theme-primary/10 flex items-center justify-center text-theme-primary border-2 border-theme-primary/30 shadow-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12" />
                    )}
                  </div>

                  {/* Camera overlay icon */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </label>

                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-theme-primary" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-text-primary">{user.fullName}</h2>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-3 py-1 mt-1 text-white bg-theme-primary rounded-full">
                  {formatRole(user.currentRole || "traveler")}
                </span>
              </div>
            </div>

            <div className="border-t border-border-custom pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-text-light font-medium">Account Status</span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-text-light font-medium">Email Address</span>
                <span className="text-text-primary truncate max-w-[200px] font-semibold">{user.email}</span>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isHostOrAdmin ? "md:grid-cols-2" : ""} gap-6`}>
            {/* Edit Name & Profile Card */}
            <form onSubmit={handleUpdateProfileSubmit} className="bg-bg-primary border border-border-custom p-6 space-y-4 rounded-2xl shadow-xs">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-custom pb-2 flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-theme-primary" />
                <span>Update Profile Info</span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-theme-primary text-white font-bold py-2.5 px-4 text-xs rounded-xl hover:bg-opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Name & Avatar</span>
              </button>
            </form>

            {/* Change Password Card */}
            <form onSubmit={handleChangePasswordSubmit} className="bg-bg-primary border border-border-custom p-6 space-y-4 rounded-2xl shadow-xs">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-custom pb-2 flex items-center space-x-2">
                <KeyRound className="h-4 w-4 text-theme-primary" />
                <span>Change Password</span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-theme-primary text-white font-bold py-2.5 px-4 text-xs rounded-xl hover:bg-opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>

        </div>

        {/* My Bookings List Column (Only for Travelers) */}
        {!isHostOrAdmin && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-primary border border-border-custom p-6 space-y-6 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center border-b border-border-custom pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-theme-primary" />
                  <span>My Bookings Overview</span>
                </h3>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/my-bookings")}
                  className="text-xs font-bold text-theme-primary hover:underline flex items-center space-x-1"
                >
                  <span>View Full Ledger ({myBookings.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Loading your booking records...</span>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-xl">
                  You have no active tour package or hotel stay bookings.
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.slice(0, 3).map((b: any) => {
                    const isConfirmed = b.bookingStatus === "CONFIRMED";
                    const isCancelled = b.bookingStatus === "CANCELLED";
                    const isPendingVerifying = b.bookingStatus === "PENDING" || b.paymentStatus === "PENDING";

                    return (
                      <div key={b.id} className="p-5 border border-border-custom bg-bg-secondary/20 rounded-xl space-y-3 hover:bg-bg-secondary/40 transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-custom pb-3">
                          <div>
                            <span className="text-xs text-text-light font-bold block font-mono">Ref ID: {b.id}</span>
                            <h4 className="text-sm font-bold text-text-primary mt-0.5">
                              {b.package?.title || b.hotel?.name || "Stay Booking"}
                            </h4>
                          </div>
                          <div>
                            {isConfirmed && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center space-x-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>CONFIRMED</span>
                              </span>
                            )}
                            {isPendingVerifying && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center space-x-1 animate-pulse">
                                <Clock className="h-3.5 w-3.5" />
                                <span>PENDING VERIFICATION</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center space-x-1">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>CANCELLED</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
                          <div>
                            <p>Booked On: <span className="font-semibold text-text-primary">{new Date(b.createdAt).toLocaleDateString()}</span></p>
                            <p>Paid Amount: <span className="font-bold text-[#e2136e]">BDT {b.paidAmount?.toLocaleString()}</span></p>
                          </div>
                          <div>
                            {b.paymentTxnId && (
                              <p>bKash Reference: <span className="font-mono font-bold text-text-primary">{b.paymentTxnId}</span></p>
                            )}
                          </div>
                        </div>

                        {/* PDF Voucher Download Button */}
                        {isConfirmed && b.voucherUrl && (
                          <div className="pt-2 border-t border-border-custom flex justify-end">
                            <a
                              href={getAbsoluteVoucherUrl(b.voucherUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-theme-primary text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                            >
                              <FileDown className="h-4 w-4" />
                              <span>Download PDF Voucher</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
