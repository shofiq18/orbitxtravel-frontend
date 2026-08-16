"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPayoutsQuery,
  useGetCommissionsQuery,
  useGetEscrowBookingsQuery,
  useReleasePayoutMutation,
  useGetCommissionRateQuery,
  useUpdateCommissionRateMutation,
} from "@/redux/api/admin/adminApi";
import {
  useGetPendingPaymentsQuery,
  useVerifyPaymentMutation,
} from "@/redux/api/booking/bookingApi";
import {
  Landmark,
  Loader2,
  Send,
  Percent,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Sparkles,
  Wallet,
  DollarSign,
  Copy,
  CheckCircle2,
  FileText,
  Building2,
  SlidersHorizontal,
  Save,
  Tag
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminAccountingPage() {
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
  const { data: payoutsResponse, isLoading: isLoadingPayouts, refetch: refetchPayouts } = useGetPayoutsQuery(undefined);
  const payoutsList = payoutsResponse?.data || [];

  const { data: commissionsResponse, isLoading: isLoadingCommissions, refetch: refetchCommissions } = useGetCommissionsQuery(undefined);
  const commissionsList = commissionsResponse?.data || [];

  const { data: pendingPaymentsResponse, isLoading: isLoadingPending, refetch: refetchPending } = useGetPendingPaymentsQuery(undefined);
  const pendingPaymentsList = pendingPaymentsResponse?.data || [];

  const { data: escrowBookingsResponse, isLoading: isLoadingEscrow, refetch: refetchEscrow } = useGetEscrowBookingsQuery(undefined);
  const escrowBookingsList = escrowBookingsResponse?.data || [];

  const { data: commissionRateResponse, refetch: refetchCommissionRate } = useGetCommissionRateQuery(undefined);
  const activeRatePercentage = commissionRateResponse?.data?.ratePercentage ?? 10;
  const [inputRate, setInputRate] = useState<string>("10");

  useEffect(() => {
    if (activeRatePercentage !== undefined && activeRatePercentage !== null) {
      setInputRate(String(activeRatePercentage));
    }
  }, [activeRatePercentage]);

  // Mutations
  const [releasePayout, { isLoading: isReleasing }] = useReleasePayoutMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [updateCommissionRate, { isLoading: isUpdatingRate }] = useUpdateCommissionRateMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<"pending" | "escrow" | "payouts" | "commissions">("pending");

  // Rejection modal state
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Payout Form States
  const [payoutHostId, setPayoutHostId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRef, setPayoutRef] = useState("");

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
      refetchEscrow();
      refetchCommissions();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update platform commission rate.");
    }
  };

  const handleApprovePayment = async (bookingId: string) => {
    try {
      toast.loading("Verifying bKash payment & locking funds to Escrow...", { id: "verify-p" });
      const res = await verifyPayment({
        bookingId,
        body: { action: "APPROVE" },
      }).unwrap();

      toast.success(res?.message || "Payment verified & locked to Escrow!", { id: "verify-p" });
      refetchPending();
      refetchEscrow();
      refetchCommissions();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to verify payment.", { id: "verify-p" });
    }
  };

  const handleRejectPaymentSubmit = async () => {
    if (!rejectingBookingId) return;
    try {
      toast.loading("Rejecting payment submission...", { id: "reject-p" });
      const res = await verifyPayment({
        bookingId: rejectingBookingId,
        body: { action: "REJECT", reason: rejectReason || "Transaction ID invalid or money not received." },
      }).unwrap();

      toast.success(res?.message || "Payment submission rejected.", { id: "reject-p" });
      setRejectingBookingId(null);
      setRejectReason("");
      refetchPending();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject payment.", { id: "reject-p" });
    }
  };

  const handleSelectBookingForDisbursal = (booking: any) => {
    const hostUser = booking.hostUser;
    if (!hostUser) {
      toast.error("Host user information not found for this booking.");
      return;
    }
    setPayoutHostId(hostUser.id);
    setPayoutAmount(String(booking.remainingDisbursalDue));
    setPayoutRef(booking.id);
    toast.success(`Auto-filled settlement form for ${hostUser.fullName}!`);
  };

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
      refetchEscrow();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to release payout.");
    }
  };

  // Calculations
  const totalCommissions = commissionsList.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalPayouts = payoutsList.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const netEarnings = totalCommissions;

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[85vh] space-y-8">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-theme-primary/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Financial Settlement Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Accounting & Escrow Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verify manual bKash deposits, monitor escrow balances, disburse host shares, and configure dynamic commission rates.
            </p>
          </div>

          {/* Active Dynamic Rate Pill in Banner */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center space-x-3 shrink-0 shadow-lg">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">Active Dynamic Rate</span>
              <span className="text-xl font-black text-white">{activeRatePercentage}% Commission</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC COMMISSION RATE CONTROL CARD */}
      <div className="border border-border-custom bg-gradient-to-r from-indigo-900/10 via-bg-primary to-bg-primary p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl border border-theme-primary/20">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">
                Dynamic Platform Commission Rate Configurator
              </h2>
              <p className="text-xs text-text-light">
                Adjust platform commission cut % for all tour bookings & hotel stays in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Current System Rate: {activeRatePercentage}%</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  activeRatePercentage === rateVal
                    ? "bg-theme-primary text-white border-theme-primary shadow-sm"
                    : "bg-bg-secondary border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-primary"
                }`}
              >
                {rateVal}%
              </button>
            ))}
          </div>

          {/* Custom Percentage Input & Save Button */}
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
              <span>Save Rate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border-custom bg-bg-primary p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-theme-primary/5 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-text-light uppercase tracking-wider block">Total Commission Revenue</span>
              <div className="text-2xl font-black text-text-primary">BDT {totalCommissions.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-theme-primary/10 text-theme-primary rounded-2xl border border-theme-primary/20">
              <Percent className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-custom/60 flex items-center justify-between text-[11px] text-emerald-600 font-bold">
            <div className="flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>Platform Service Charge</span>
            </div>
            <span className="bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{activeRatePercentage}% Active</span>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-amber-500/5 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-text-light uppercase tracking-wider block">Disbursed Host Payouts</span>
              <div className="text-2xl font-black text-text-primary">BDT {totalPayouts.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <Landmark className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-custom/60 flex items-center text-[11px] text-amber-600 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            <span>Cleared Host Transfers</span>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-emerald-500/5 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-text-light uppercase tracking-wider block">Net Platform Earnings</span>
              <div className="text-2xl font-black text-emerald-600">BDT {netEarnings.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-custom/60 flex items-center text-[11px] text-emerald-600 font-bold">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            <span>Retained Profit Net</span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Manual Settlement Action Form */}
        <div className="h-fit">
          <form onSubmit={handleReleasePayoutSubmit} className="border border-border-custom bg-bg-primary p-6 space-y-5 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-border-custom pb-3">
              <div className="p-2.5 bg-theme-primary/10 text-theme-primary rounded-xl">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary tracking-wide">
                  Host Settlement Authorization
                </h3>
                <p className="text-[11px] text-text-light">Disburse net escrow balance to host</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Host User UUID *</label>
              <input
                type="text"
                required
                placeholder="Paste host user UUID"
                value={payoutHostId}
                onChange={(e) => setPayoutHostId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Payout Amount (BDT) *</label>
              <input
                type="number"
                required
                placeholder="Net amount due to vendor"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono font-extrabold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Reference Booking ID *</label>
              <input
                type="text"
                required
                placeholder="Reference booking transaction UUID"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isReleasing}
              className="w-full bg-btn-primary text-btn-text-primary font-extrabold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-xl text-xs cursor-pointer shadow-md hover:shadow-lg"
            >
              {isReleasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Disburse Settlement Payout</span>
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Tabs for logs */}
        <div className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 space-y-5 rounded-3xl shadow-sm">
          
          {/* Custom Styled Pill Tabs */}
          <div className="flex border border-border-custom p-1.5 bg-bg-secondary/60 rounded-2xl overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#e2136e] text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              }`}
            >
              <span>Pending bKash Approvals</span>
              {pendingPaymentsList.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === "pending" ? "bg-white text-[#e2136e]" : "bg-[#e2136e] text-white"
                }`}>
                  {pendingPaymentsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("escrow")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "escrow"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              }`}
            >
              <span>Escrow Held Bookings</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "escrow" ? "bg-white text-emerald-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {escrowBookingsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payouts")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "payouts"
                  ? "bg-theme-primary text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              }`}
            >
              <span>Host Payouts Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "commissions"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              }`}
            >
              <span>Platform Commissions</span>
            </button>
          </div>

          {/* TAB 1: PENDING BKASH VERIFICATIONS */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {isLoadingPending ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving pending bKash verification requests...</span>
                </div>
              ) : pendingPaymentsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs border border-dashed border-border-custom bg-bg-secondary/20 rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <span>No bKash manual payment submissions awaiting verification.</span>
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {pendingPaymentsList.map((item: any) => {
                    const hostUser = item.package?.organizer || item.room?.hotel?.owner;
                    const hostId = hostUser?.id || "";
                    return (
                      <div key={item.id} className="p-5 border border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-bg-primary to-bg-primary rounded-2xl text-xs space-y-4 shadow-2xs hover:border-amber-300 transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-custom/80 pb-3">
                          <div>
                            <span className="font-extrabold text-text-primary font-mono text-sm block">Booking Ref: {item.id}</span>
                            <span className="text-[11px] text-text-light">Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          <span className="bg-[#e2136e]/10 text-[#e2136e] border border-[#e2136e]/30 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#e2136e] animate-ping" />
                            <span>bKash Verification Pending</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-text-secondary">
                          <div className="bg-bg-secondary/40 p-3 rounded-xl border border-border-custom/50">
                            <p className="text-text-light text-[9px] font-extrabold uppercase tracking-wider mb-1">TRAVELER DETAILS</p>
                            <p className="font-extrabold text-text-primary text-xs">{item.traveler?.fullName}</p>
                            <p className="text-[11px] text-text-light font-mono">{item.traveler?.email}</p>
                          </div>
                          <div className="bg-bg-secondary/40 p-3 rounded-xl border border-border-custom/50">
                            <p className="text-text-light text-[9px] font-extrabold uppercase tracking-wider mb-1">BOOKED ITEM & DEPOSIT</p>
                            <p className="font-extrabold text-text-primary text-xs line-clamp-1">{item.package?.title || item.room?.hotel?.name}</p>
                            <p className="text-[11px]">Deposit Amount: <span className="font-black text-[#e2136e]">BDT {item.paidAmount?.toLocaleString()}</span></p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-pink-50 via-pink-50/30 to-bg-primary p-3 rounded-xl border border-[#e2136e]/30 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-extrabold text-[#e2136e] uppercase tracking-wider">bKash Transaction TrxID</p>
                            <p className="font-mono font-black text-base text-[#e2136e]">{item.paymentTxnId}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingBookingId(item.id);
                              setRejectReason("");
                            }}
                            disabled={isVerifying}
                            className="px-4 py-2 border border-red-200 bg-red-50 text-red-700 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject Payment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleApprovePayment(item.id);
                              if (hostId) {
                                setPayoutHostId(hostId);
                                setPayoutRef(item.id);
                                const commission = item.paidAmount * (activeRatePercentage / 100);
                                setPayoutAmount(String(item.paidAmount - commission));
                              }
                            }}
                            disabled={isVerifying}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve & Lock to Escrow</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ESCROW HELD BOOKINGS */}
          {activeTab === "escrow" && (
            <div className="space-y-4">
              {isLoadingEscrow ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving Escrow held bookings...</span>
                </div>
              ) : escrowBookingsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs border border-dashed border-border-custom bg-bg-secondary/20 rounded-2xl">
                  No verified bookings currently held in Escrow.
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {escrowBookingsList.map((item: any) => (
                    <div key={item.id} className="p-5 border border-border-custom bg-bg-secondary/30 rounded-2xl text-xs space-y-4 hover:border-theme-primary/30 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-custom pb-3">
                        <div>
                          <span className="font-black text-text-primary font-mono text-sm block">Booking Ref: {item.id}</span>
                          <span className="text-[11px] text-text-light">Confirmed: {new Date(item.updatedAt || item.createdAt).toLocaleString()}</span>
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                          item.isFullyDisbursed
                            ? "bg-slate-100 text-slate-700 border border-slate-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}>
                          {item.isFullyDisbursed ? "FULLY DISBURSED" : "HELD IN ESCROW"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-text-secondary">
                        <div className="bg-bg-primary p-3 rounded-xl border border-border-custom/60 space-y-1">
                          <p className="text-text-light text-[9px] font-extrabold uppercase tracking-wider">HOST VENDOR</p>
                          <p className="font-extrabold text-text-primary text-xs">{item.hostUser?.fullName || "Unknown Vendor"}</p>
                          <p className="text-[11px] font-mono text-text-light">{item.hostUser?.email}</p>
                        </div>
                        <div className="bg-bg-primary p-3 rounded-xl border border-border-custom/60 space-y-1">
                          <p className="text-text-light text-[9px] font-extrabold uppercase tracking-wider">FINANCIAL BREAKDOWN</p>
                          <div className="flex justify-between text-[11px]">
                            <span>Paid Amount:</span>
                            <span className="font-bold text-text-primary">BDT {item.paidAmount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span>Net Host Share:</span>
                            <span className="font-bold text-emerald-600">BDT {item.netHostShare?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-1 border-t border-border-custom/50">
                            <span className="font-bold">Remaining Due:</span>
                            <span className="font-black text-amber-600">BDT {item.remainingDisbursalDue?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {!item.isFullyDisbursed && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectBookingForDisbursal(item)}
                            className="px-4 py-2 bg-gradient-to-r from-theme-primary to-indigo-600 hover:from-indigo-600 hover:to-theme-primary text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <span>Select for Disbursal</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOST PAYOUTS LEDGER */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              {isLoadingPayouts ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving payouts ledger...</span>
                </div>
              ) : payoutsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs border border-dashed border-border-custom bg-bg-secondary/20 rounded-2xl">
                  No payout transactions logged in system registry.
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {payoutsList.map((payout: any) => (
                    <div key={payout.id} className="p-4 border border-border-custom bg-bg-secondary/40 rounded-2xl text-xs space-y-2 text-text-secondary hover:border-theme-primary/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-text-primary font-mono text-xs">Txn Ref: {payout.id}</span>
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                          DISBURSED PAYOUT
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-text-light text-[9px] font-bold block uppercase">Recipient Host</span>
                          <span className="font-extrabold text-text-primary">{payout.receiver?.fullName || "Unknown Vendor"}</span>
                        </div>
                        <div>
                          <span className="text-text-light text-[9px] font-bold block uppercase">Amount Transferred</span>
                          <span className="font-black text-emerald-600 text-xs">BDT {payout.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-text-light pt-1 border-t border-border-custom/40">
                        <span className="font-mono">Ref ID: {payout.referenceId}</span>
                        <span>Cleared: {new Date(payout.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMISSIONS LEDGER */}
          {activeTab === "commissions" && (
            <div className="space-y-4">
              {isLoadingCommissions ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving commissions ledger...</span>
                </div>
              ) : commissionsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs border border-dashed border-border-custom bg-bg-secondary/20 rounded-2xl">
                  No platform commission transactions logged.
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {commissionsList.map((comm: any) => (
                    <div key={comm.id} className="p-4 border border-border-custom bg-bg-secondary/40 rounded-2xl text-xs space-y-2 text-text-secondary hover:border-theme-primary/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-text-primary font-mono text-xs">Txn Ref: {comm.id}</span>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                          COMMISSION REVENUE
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Earned Commission:</span>
                        <span className="font-black text-emerald-600 text-xs">BDT {comm.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-text-light pt-1 border-t border-border-custom/40">
                        <span className="font-mono">Ref ID: {comm.referenceId}</span>
                        <span>Cleared: {new Date(comm.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom p-6 max-w-md w-full rounded-3xl space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-extrabold text-text-primary">Reject bKash Payment Submission</h3>
            <p className="text-xs text-text-light leading-relaxed">
              Provide a reason for rejecting this manual payment submission (e.g. TrxID invalid or money not received in bKash statement):
            </p>
            
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. TrxID 8K2HJX9 not found in OrbitX bKash statement."
              className="w-full p-3.5 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-2xl outline-none focus:border-theme-primary font-medium"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingBookingId(null)}
                className="px-4 py-2 border border-border-custom text-text-secondary text-xs font-bold rounded-xl hover:bg-bg-secondary transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPaymentSubmit}
                disabled={isVerifying}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
