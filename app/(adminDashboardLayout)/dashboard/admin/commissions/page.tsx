"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetCommissionsQuery } from "@/redux/api/admin/adminApi";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminCommissionsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is admin
  if (!user || user.currentRole !== "admin") {
    toast.error("Access Denied: Admin privileges required.");
    router.push("/");
  }

  // API Queries
  const { data: commissionsResponse, isLoading: isLoadingComms } = useGetCommissionsQuery(undefined);
  const commissions = commissionsResponse?.data || [];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Commissions Ledger</h1>
        <p className="text-sm text-text-light mt-1">Audit platform commission cuts from vendor bookings.</p>
      </div>

      <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
        <h3 className="text-base font-bold text-text-primary tracking-wide border-b border-border-custom pb-2">
          Platform retained commissions ledger log
        </h3>

        {isLoadingComms ? (
          <div className="flex items-center justify-center py-12 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading commissions ledger...</span>
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom rounded-none bg-bg-secondary/20">
            No commission entries registered.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-custom rounded-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary text-text-primary border-b border-border-custom font-bold">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Retained Fee</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reference Booking ID</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom font-medium text-text-secondary">
                {commissions.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-text-primary">{comm.id}</td>
                    <td className="p-4 text-theme-secondary font-bold text-sm">BDT {comm.amount}</td>
                    <td className="p-4"><span className="bg-theme-secondary/10 border border-theme-secondary/20 text-theme-secondary px-2 py-0.5 tracking-wide text-[10px] font-bold rounded-none">COMMISSION</span></td>
                    <td className="p-4 font-mono">{comm.referenceId}</td>
                    <td className="p-4">{new Date(comm.createdAt).toLocaleString()}</td>
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
