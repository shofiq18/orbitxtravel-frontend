"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPayoutsQuery,
  useGetCommissionsQuery,
  useReleasePayoutMutation,
} from "@/redux/api/admin/adminApi";
import { Landmark, Loader2, Send, Percent, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminAccountingPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is admin
  if (!user || user.currentRole !== "admin") {
    toast.error("Access Denied: Admin privileges required.");
    router.push("/");
  }

  // API Queries
  const { data: payoutsResponse, isLoading: isLoadingPayouts, refetch: refetchPayouts } = useGetPayoutsQuery(undefined);
  const payoutsList = payoutsResponse?.data || [];

  const { data: commissionsResponse, isLoading: isLoadingCommissions, refetch: refetchCommissions } = useGetCommissionsQuery(undefined);
  const commissionsList = commissionsResponse?.data || [];

  // Mutations
  const [releasePayout, { isLoading: isReleasing }] = useReleasePayoutMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<"payouts" | "commissions">("payouts");

  // Payout Form States
  const [payoutHostId, setPayoutHostId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRef, setPayoutRef] = useState("");

  const handleReleasePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutHostId || !payoutAmount || !payoutRef) {
      toast.error("Please fill out all settlement payout variables.");
      return;
    }

    try {
      const response = await releasePayout({
        hostId: payoutHostId,
        amount: Number(payoutAmount),
        referenceId: payoutRef,
      }).unwrap();
      
      toast.success(response?.message || "Payout released and logged successfully!");
      setPayoutHostId("");
      setPayoutAmount("");
      setPayoutRef("");
      refetchPayouts();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to release payout.");
    }
  };

  // Calculations
  const totalCommissions = commissionsList.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalPayouts = payoutsList.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const netEarnings = totalCommissions;

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Payment Accounting & Ledgers</h1>
        <p className="text-sm text-text-light mt-1">Audit platform commissions, manage host payouts, and trace settlement records.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-theme-primary/10 text-theme-primary">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Total Commission Revenue</p>
            <p className="text-xl font-bold text-text-primary mt-1">BDT {totalCommissions.toLocaleString()}</p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-amber-50 text-amber-600">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Disbursed Host Payouts</p>
            <p className="text-xl font-bold text-text-primary mt-1">BDT {totalPayouts.toLocaleString()}</p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-none">
          <div className="p-3 bg-green-50 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Net Platform Earnings</p>
            <p className="text-xl font-bold text-text-primary mt-1">BDT {netEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Payout Action Form (Always Visible for quick access) */}
        <div className="h-fit">
          <form onSubmit={handleReleasePayoutSubmit} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none">
            <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2 flex items-center space-x-1.5">
              <Landmark className="h-4 w-4 text-theme-primary" />
              <span>Release Host Settlement</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Host User ID *</label>
              <input
                type="text"
                required
                placeholder="Paste host user UUID"
                value={payoutHostId}
                onChange={(e) => setPayoutHostId(e.target.value)}
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Payout Amount (BDT) *</label>
              <input
                type="number"
                required
                placeholder="Net amount due to vendor"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Reference Booking ID *</label>
              <input
                type="text"
                required
                placeholder="Reference transaction UUID"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isReleasing}
              className="w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer pt-3"
            >
              {isReleasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              <span>Disburse Settlement Payout</span>
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Tabs for logs (Payouts vs Commissions) */}
        <div className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none">
          {/* Tabs bar */}
          <div className="flex border-b border-border-custom">
            <button
              onClick={() => setActiveTab("payouts")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "payouts"
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              Host Payouts Ledger
            </button>
            <button
              onClick={() => setActiveTab("commissions")}
              className={`ml-4 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "commissions"
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              Platform Commissions Ledger
            </button>
          </div>

          {/* Tab Contents: Payouts */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              {isLoadingPayouts ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving payouts ledger...</span>
                </div>
              ) : payoutsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-none">
                  No payout transactions logged in system registry.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {payoutsList.map((payout: any) => (
                    <div key={payout.id} className="p-4 border border-border-custom bg-bg-secondary/35 rounded-none text-xs space-y-1.5 text-text-secondary hover:bg-bg-secondary/60 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-text-primary font-mono text-sm">Txn Ref: {payout.id}</span>
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 tracking-wide text-[9px] font-bold rounded-none uppercase">DISBURSED</span>
                      </div>
                      <p>Recipient Host ID: <span className="font-mono text-text-primary">{payout.receiverId}</span></p>
                      <p>Recipient Host Name: <span className="font-bold text-text-primary">{payout.receiver?.fullName || "Unknown Vendor"}</span></p>
                      <p>Amount Transferred: <span className="font-bold text-theme-secondary">BDT {payout.amount.toLocaleString()}</span></p>
                      <p>Reference Booking ID: <span className="font-mono text-text-primary">{payout.referenceId}</span></p>
                      <p className="text-[10px] text-text-light">Cleared on: {new Date(payout.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Contents: Commissions */}
          {activeTab === "commissions" && (
            <div className="space-y-4">
              {isLoadingCommissions ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving commissions ledger...</span>
                </div>
              ) : commissionsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-none">
                  No platform commission transactions logged.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {commissionsList.map((comm: any) => (
                    <div key={comm.id} className="p-4 border border-border-custom bg-bg-secondary/35 rounded-none text-xs space-y-1.5 text-text-secondary hover:bg-bg-secondary/60 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-text-primary font-mono text-sm">Txn Ref: {comm.id}</span>
                        <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 tracking-wide text-[9px] font-bold rounded-none uppercase">COMMISSION REVENUE</span>
                      </div>
                      <p>Earned Amount: <span className="font-bold text-theme-secondary">BDT {comm.amount.toLocaleString()}</span></p>
                      <p>Reference Booking ID: <span className="font-mono text-text-primary">{comm.referenceId}</span></p>
                      <p className="text-[10px] text-text-light">Cleared on: {new Date(comm.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
