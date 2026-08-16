"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetVendorsQueueQuery,
  useVerifyVendorMutation,
} from "@/redux/api/admin/adminApi";
import { Loader2, Check, X, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminOnboardingPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is admin
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.currentRole !== "admin") {
      toast.error("Access Denied: Admin privileges required.");
      router.push("/");
    }
  }, [user, router]);

  // API Queries
  const { data: queueResponse, isLoading: isLoadingQueue, refetch: refetchQueue } = useGetVendorsQueueQuery(undefined);
  const queue = queueResponse?.data || [];

  // Mutations
  const [verifyVendor] = useVerifyVendorMutation();

  // Process Indicators for Onboarding Action Updates
  const [processingHostId, setProcessingHostId] = useState<string | null>(null);
  const [processedStatus, setProcessedStatus] = useState<{[key: string]: 'approved' | 'rejected'}>({});
  
  // Modal State for Onboarding Details View
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const handleVerifyVendor = async (userId: string, approve: boolean) => {
    setProcessingHostId(userId);
    try {
      const response = await verifyVendor({
        userId,
        body: { isVerified: approve },
      }).unwrap();
      toast.success(response?.message || `Host application ${approve ? "approved" : "rejected"} successfully!`);
      setProcessedStatus(prev => ({ ...prev, [userId]: approve ? 'approved' : 'rejected' }));
      setTimeout(() => {
        refetchQueue();
      }, 2000);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update vendor verification status.");
    } finally {
      setProcessingHostId(null);
    }
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Vendor Onboarding Queue</h1>
        <p className="text-sm text-text-light mt-1">Review vendor accounts and approve or reject onboarding requests.</p>
      </div>

      <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
        <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
          Pending Host Verification Applications
        </h3>

        {isLoadingQueue ? (
          <div className="flex items-center justify-center py-12 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading application queue...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom rounded-none bg-bg-secondary/20">
            The onboarding review queue is currently empty.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold text-text-secondary border border-border-custom">
              <thead>
                <tr className="border-b border-border-custom bg-bg-secondary text-text-primary text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 border-r border-border-custom">Vendor Name</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Email</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Hosting Type</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Business Title</th>
                  <th className="py-3.5 px-4 border-r border-border-custom">Queue Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom bg-bg-primary">
                {queue.map((app: any) => (
                  <tr key={app.id} className="hover:bg-bg-secondary/35 transition-colors">
                    <td className="py-3.5 px-4 border-r border-border-custom font-bold text-text-primary">{app.fullName}</td>
                    <td className="py-3.5 px-4 border-r border-border-custom font-mono">{app.email}</td>
                    <td className="py-3.5 px-4 border-r border-border-custom">
                      <span className="text-theme-primary font-bold uppercase text-[10px]">
                        {app.vendorType?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border-r border-border-custom">{app.businessProfile?.businessName || "N/A"}</td>
                    <td className="py-3.5 px-4 border-r border-border-custom">
                      {app.isVerified || processedStatus[app.id] === 'approved' ? (
                        <span className="text-green-600 font-bold flex items-center space-x-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Approved</span>
                        </span>
                      ) : processedStatus[app.id] === 'rejected' ? (
                        <span className="text-red-600 font-bold flex items-center space-x-1">
                          <X className="h-3.5 w-3.5" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Pending Review</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center space-x-1 bg-theme-secondary text-white px-3 py-1.5 hover:bg-opacity-95 transition rounded-none cursor-pointer text-[10px] font-bold"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal overlay */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg-primary max-w-lg w-full p-6 md:p-8 relative rounded-none border border-border-custom space-y-6 animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center border-b border-border-custom pb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
                  Onboarding Details
                </h3>
                <p className="text-[11px] text-text-light font-medium mt-0.5">Submitted by {selectedApp.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-text-secondary hover:text-text-primary text-xl font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 font-semibold text-text-secondary max-h-[55vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">User ID</span>
                <span className="col-span-2 font-mono text-text-primary select-all">{selectedApp.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">Email Address</span>
                <span className="col-span-2 text-text-primary">{selectedApp.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">Hosting Type</span>
                <span className="col-span-2 text-theme-primary font-bold uppercase text-[10px]">
                  {selectedApp.vendorType?.replace("_", " ")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">Business Name</span>
                <span className="col-span-2 text-text-primary">{selectedApp.businessProfile?.businessName || "N/A"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">License Number</span>
                <span className="col-span-2 text-text-primary">{selectedApp.businessProfile?.licenseNumber || "N/A"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border-custom/40">
                <span className="text-text-light font-bold">Business Address</span>
                <span className="col-span-2 text-text-primary">{selectedApp.businessProfile?.address || "N/A"}</span>
              </div>

              {/* Payout Details Section */}
              <div className="mt-4 pt-3 border-t border-border-custom/60 space-y-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Payout & Financial details
                </h4>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-border-custom/20">
                  <span className="text-text-light font-bold">Bank Name</span>
                  <span className="col-span-2 text-text-primary">{selectedApp.payoutDetails?.bankName || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-border-custom/20">
                  <span className="text-text-light font-bold">Account Number</span>
                  <span className="col-span-2 text-text-primary">{selectedApp.payoutDetails?.accountNumber || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-border-custom/20">
                  <span className="text-text-light font-bold">Branch Name</span>
                  <span className="col-span-2 text-text-primary">{selectedApp.payoutDetails?.branch || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-border-custom/20">
                  <span className="text-text-light font-bold">bKash Number</span>
                  <span className="col-span-2 text-text-primary">{selectedApp.payoutDetails?.bkashNumber || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-border-custom/20">
                  <span className="text-text-light font-bold">Nagad Number</span>
                  <span className="col-span-2 text-text-primary">{selectedApp.payoutDetails?.nagadNumber || "N/A"}</span>
                </div>
              </div>

              <div className="py-2.5">
                <span className="text-text-light font-bold block mb-1.5">Verification Credentials</span>
                {selectedApp.verificationDocUrl ? (
                  <a
                    href={selectedApp.verificationDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-theme-primary hover:underline font-bold"
                  >
                    <span>View Uploaded Credentials PDF</span>
                    <span className="text-xs">&rarr;</span>
                  </a>
                ) : (
                  <span className="text-red-500 font-bold italic">No document uploaded</span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2.5 pt-4 border-t border-border-custom">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-bg-secondary transition border border-border-custom cursor-pointer"
              >
                Cancel
              </button>
              
              {processedStatus[selectedApp.id] === 'approved' ? (
                <span className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 text-xs font-bold flex items-center space-x-1 rounded-none">
                  <Check className="h-4 w-4" />
                  <span>Approved</span>
                </span>
              ) : processedStatus[selectedApp.id] === 'rejected' ? (
                <span className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-xs font-bold flex items-center space-x-1 rounded-none">
                  <X className="h-4 w-4" />
                  <span>Rejected</span>
                </span>
              ) : processingHostId === selectedApp.id ? (
                <div className="flex items-center space-x-2 text-xs font-semibold text-text-light px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-theme-primary" />
                  <span>Saving Decision...</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleVerifyVendor(selectedApp.id, false);
                      setSelectedApp(null);
                    }}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 hover:bg-red-100 transition rounded-none cursor-pointer flex items-center space-x-1 text-xs font-bold"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleVerifyVendor(selectedApp.id, true);
                      setSelectedApp(null);
                    }}
                    className="bg-theme-secondary text-white px-4 py-2 hover:bg-opacity-95 transition rounded-none cursor-pointer flex items-center space-x-1 text-xs font-bold"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve Host</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
