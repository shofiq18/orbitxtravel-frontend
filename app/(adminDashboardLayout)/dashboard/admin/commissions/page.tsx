"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetCommissionsQuery,
  useGetCommissionRateQuery,
  useUpdateCommissionRateMutation,
} from "@/redux/api/admin/adminApi";
import { Loader2, Percent, SlidersHorizontal, Save, Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminCommissionsPage() {
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
  const { data: commissionsResponse, isLoading: isLoadingComms, refetch: refetchCommissions } = useGetCommissionsQuery(undefined);
  const commissions = commissionsResponse?.data || [];

  const { data: commissionRateResponse, refetch: refetchCommissionRate } = useGetCommissionRateQuery(undefined);
  const activeRatePercentage = commissionRateResponse?.data?.ratePercentage ?? 10;
  const [inputRate, setInputRate] = useState<string>("10");

  useEffect(() => {
    if (activeRatePercentage !== undefined && activeRatePercentage !== null) {
      setInputRate(String(activeRatePercentage));
    }
  }, [activeRatePercentage]);

  const [updateCommissionRate, { isLoading: isUpdatingRate }] = useUpdateCommissionRateMutation();

  const handleUpdateCommissionRate = async (presetVal?: number) => {
    const targetVal = presetVal !== undefined ? presetVal : Number(inputRate);
    if (isNaN(targetVal) || targetVal < 0 || targetVal > 100) {
      toast.error("Please enter a valid commission percentage rate between 0% and 100%.");
      return;
    }

    try {
      await updateCommissionRate({ ratePercentage: targetVal }).unwrap();
      toast.success(`Platform commission rate updated to ${targetVal}%!`);
      setInputRate(String(targetVal));
      refetchCommissionRate();
      refetchCommissions();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update platform commission rate.");
    }
  };

  const totalRetained = commissions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[85vh] space-y-8">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-theme-primary/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Platform Revenue Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Commissions & Rate Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dynamically set platform service charge percentage (%) and audit all automatically retained booking commissions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center space-x-3 shrink-0 shadow-lg">
            <div className="p-2.5 bg-theme-primary text-white rounded-xl shadow-md">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200 block">Current Commission Rate</span>
              <span className="text-xl font-black text-white">{activeRatePercentage}% Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC COMMISSION RATE CONFIGURATOR */}
      <div className="border border-border-custom bg-gradient-to-r from-indigo-900/10 via-bg-primary to-bg-primary p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl border border-theme-primary/20">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">
                Dynamic Commission Rate Configurator
              </h2>
              <p className="text-xs text-text-light">
                Change rate percentage (%) dynamically across all tour packages and hotel bookings (e.g., 5%, 10%, 15%).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Rate: {activeRatePercentage}%</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-1">
          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-extrabold text-text-light uppercase tracking-wider mr-1">Presets:</span>
            {[5, 8, 10, 12, 15, 20].map((rateVal) => (
              <button
                key={rateVal}
                type="button"
                onClick={() => handleUpdateCommissionRate(rateVal)}
                disabled={isUpdatingRate}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  activeRatePercentage === rateVal
                    ? "bg-theme-primary text-white border-theme-primary shadow-sm"
                    : "bg-bg-secondary border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-primary"
                }`}
              >
                {rateVal}%
              </button>
            ))}
          </div>

          {/* Custom Input & Button */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <div className="relative flex-1 md:w-44">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={inputRate}
                onChange={(e) => setInputRate(e.target.value)}
                placeholder="Custom %"
                className="w-full pl-3 pr-8 py-2 text-xs font-extrabold font-mono text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-light">%</span>
            </div>

            <button
              type="button"
              disabled={isUpdatingRate}
              onClick={() => handleUpdateCommissionRate()}
              className="px-5 py-2 bg-theme-primary hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isUpdatingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save New Rate</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMMISSIONS LEDGER LOG */}
      <div className="border border-border-custom bg-bg-primary p-6 space-y-5 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center border-b border-border-custom pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-primary tracking-wide">
                Platform Commission Transactions Ledger Log
              </h3>
              <p className="text-xs text-text-light">Audited platform service charge retentions</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Total Retained: BDT {totalRetained.toLocaleString()}
          </span>
        </div>

        {isLoadingComms ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
            <span>Loading commissions ledger...</span>
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12 text-text-light font-bold text-xs border border-dashed border-border-custom rounded-2xl bg-bg-secondary/20">
            No platform commission transactions registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-custom rounded-2xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary/80 text-text-light border-b border-border-custom font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Transaction Ref ID</th>
                  <th className="p-4">Retained Amount</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Reference Booking ID</th>
                  <th className="p-4">Cleared Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/60 text-text-primary">
                {commissions.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-text-primary text-xs">{comm.id}</td>
                    <td className="p-4 text-emerald-600 font-black text-sm">BDT {comm.amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                        COMMISSION
                      </span>
                    </td>
                    <td className="p-4 font-mono text-text-light">{comm.referenceId}</td>
                    <td className="p-4 text-text-light">{new Date(comm.createdAt).toLocaleString()}</td>
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
