"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetVendorsQueueQuery,
  useVerifyVendorMutation,
} from "@/redux/api/admin/adminApi";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminOnboardingPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is admin
  if (!user || user.currentRole !== "admin") {
    toast.error("Access Denied: Admin privileges required.");
    router.push("/");
  }

  // API Queries
  const { data: queueResponse, isLoading: isLoadingQueue, refetch: refetchQueue } = useGetVendorsQueueQuery(undefined);
  const queue = queueResponse?.data || [];

  // Mutations
  const [verifyVendor] = useVerifyVendorMutation();

  // Process Indicators for Onboarding Action Updates
  const [processingHostId, setProcessingHostId] = useState<string | null>(null);
  const [processedStatus, setProcessedStatus] = useState<{[key: string]: 'approved' | 'rejected'}>({});

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
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Vendor Onboarding Queue</h1>
        <p className="text-sm text-text-light mt-1">Review vendor accounts and approve or reject onboarding requests.</p>
      </div>

      <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
        <h3 className="text-base font-bold text-text-primary tracking-wide border-b border-border-custom pb-2">
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
          <div className="grid grid-cols-1 gap-6">
            {queue.map((app: any) => (
              <div key={app.id} className="border border-border-custom p-5 bg-bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
                <div className="space-y-2">
                  <p className="font-bold text-text-primary text-base">{app.fullName}</p>
                  <p className="text-xs text-text-light font-mono">User ID: {app.id} | Email: {app.email}</p>
                  
                  <div className="p-3 bg-bg-primary border border-border-custom text-xs space-y-1 rounded-none text-text-secondary font-medium">
                    <p><span className="font-bold text-text-primary">Hosting Type Requested:</span> <span className="text-theme-primary font-bold">{app.vendorType?.replace("_", " ")}</span></p>
                    <p><span className="font-bold text-text-primary">Business Profile Name:</span> {app.businessProfile?.businessName}</p>
                    <p><span className="font-bold text-text-primary">Address:</span> {app.businessProfile?.address}</p>
                    <p><span className="font-bold text-text-primary">License Number:</span> {app.businessProfile?.licenseNumber}</p>
                    <p className="pt-1">
                      <a href={app.verificationDocUrl} target="_blank" rel="noreferrer" className="text-theme-primary font-bold hover:underline">
                        View Uploaded Verification Credentials PDF &rarr;
                      </a>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 shrink-0 items-center">
                  {processedStatus[app.id] ? (
                    processedStatus[app.id] === 'approved' ? (
                      <span className="bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 text-xs font-bold flex items-center space-x-1 rounded-none">
                        <Check className="h-4 w-4" />
                        <span>Approved Successfully</span>
                      </span>
                    ) : (
                      <span className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 text-xs font-bold flex items-center space-x-1 rounded-none">
                        <X className="h-4 w-4" />
                        <span>Rejected Successfully</span>
                      </span>
                    )
                  ) : processingHostId === app.id ? (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-text-light py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-theme-primary" />
                      <span>Processing decision...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleVerifyVendor(app.id, false)}
                        disabled={processingHostId !== null}
                        className="bg-red-50 text-red-600 border border-red-200 p-2.5 hover:bg-red-100 transition rounded-none cursor-pointer flex items-center space-x-1 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleVerifyVendor(app.id, true)}
                        disabled={processingHostId !== null}
                        className="bg-theme-secondary text-white p-2.5 hover:bg-opacity-95 transition rounded-none cursor-pointer flex items-center space-x-1 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="h-4 w-4" />
                        <span>Verify & Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
