"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPayoutsQuery,
  useGetCommissionsQuery,
  useGetEscrowBookingsQuery,
  useReleasePayoutMutation,
} from "@/redux/api/admin/adminApi";
import {
  useGetPendingPaymentsQuery,
  useVerifyPaymentMutation,
} from "@/redux/api/booking/bookingApi";
import { Landmark, Loader2, Send, Percent, TrendingUp, CheckCircle, XCircle, Clock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
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

  const { data: pendingPaymentsResponse, isLoading: isLoadingPending, refetch: refetchPending } = useGetPendingPaymentsQuery(undefined);
  const pendingPaymentsList = pendingPaymentsResponse?.data || [];

  const { data: escrowBookingsResponse, isLoading: isLoadingEscrow, refetch: refetchEscrow } = useGetEscrowBookingsQuery(undefined);
  const escrowBookingsList = escrowBookingsResponse?.data || [];

  // Mutations
  const [releasePayout, { isLoading: isReleasing }] = useReleasePayoutMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<"pending" | "escrow" | "payouts" | "commissions">("pending");

  // Rejection modal state
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Payout Form States
  const [payoutHostId, setPayoutHostId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRef, setPayoutRef] = useState("");

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
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Payment Accounting & Settlement Ledger</h1>
          <p className="text-sm text-text-light mt-1">Audit bKash manual payments, Escrow locks, host disbursals, and platform commissions.</p>
        </div>
        {pendingPaymentsList.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 animate-pulse">
            <Clock className="h-4 w-4" />
            <span>{pendingPaymentsList.length} bKash Manual Verification(s) Pending</span>
          </div>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-xl shadow-xs">
          <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-lg">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Total Commission Revenue</p>
            <p className="text-xl font-bold text-text-primary mt-1">BDT {totalCommissions.toLocaleString()}</p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-xl shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-light font-bold uppercase tracking-wider">Disbursed Host Payouts</p>
            <p className="text-xl font-bold text-text-primary mt-1">BDT {totalPayouts.toLocaleString()}</p>
          </div>
        </div>

        <div className="border border-border-custom bg-bg-primary p-5 flex items-center space-x-4 rounded-xl shadow-xs">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
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
        
        {/* Column 1: Payout Action Form */}
        <div className="h-fit">
          <form onSubmit={handleReleasePayoutSubmit} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-2xl shadow-xs">
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
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
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
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
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
                className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isReleasing}
              className="w-full bg-theme-primary text-white font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-xl text-xs cursor-pointer pt-3 shadow-sm"
            >
              {isReleasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              <span>Disburse Settlement Payout</span>
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Tabs for logs (Pending Verifications vs Escrow Bookings vs Payouts vs Commissions) */}
        <div className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 space-y-4 rounded-2xl shadow-xs">
          {/* Tabs bar */}
          <div className="flex border-b border-border-custom overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "pending"
                  ? "border-[#e2136e] text-[#e2136e]"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              <span>Pending bKash Approvals</span>
              {pendingPaymentsList.length > 0 && (
                <span className="bg-[#e2136e] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingPaymentsList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("escrow")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 cursor-pointer ${
                activeTab === "escrow"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              Escrow Held Bookings
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 cursor-pointer ${
                activeTab === "payouts"
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              Host Payouts Ledger
            </button>
            <button
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 cursor-pointer ${
                activeTab === "commissions"
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-text-light hover:text-text-secondary"
              }`}
            >
              Platform Commissions Ledger
            </button>
          </div>

          {/* Tab Contents: Pending Verifications */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {isLoadingPending ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving pending bKash verification requests...</span>
                </div>
              ) : pendingPaymentsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-xl">
                  No bKash manual payment submissions awaiting verification.
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {pendingPaymentsList.map((item: any) => {
                    const hostUser = item.package?.organizer || item.room?.hotel?.owner;
                    const hostId = hostUser?.id || "";
                    return (
                      <div key={item.id} className="p-4 border border-amber-200 bg-amber-50/20 rounded-xl text-xs space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-2">
                          <div>
                            <span className="font-bold text-text-primary font-mono text-sm block">Booking Ref: {item.id}</span>
                            <span className="text-[11px] text-text-light">Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                            VERIFICATION PENDING
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-secondary">
                          <div>
                            <p className="text-text-light text-[10px] font-bold uppercase">TRAVELER DETAILS</p>
                            <p className="font-bold text-text-primary">{item.traveler?.fullName}</p>
                            <p className="text-[11px]">{item.traveler?.email}</p>
                          </div>
                          <div>
                            <p className="text-text-light text-[10px] font-bold uppercase">BOOKED ITEM</p>
                            <p className="font-bold text-text-primary">{item.package?.title || item.room?.hotel?.name}</p>
                            <p className="text-[11px]">Deposit Amount: <span className="font-bold text-[#e2136e]">BDT {item.paidAmount?.toLocaleString()}</span></p>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">BKASH SUBMISSION REFERENCE</p>
                          <p className="font-mono font-black text-sm text-[#e2136e]">{item.paymentTxnId}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingBookingId(item.id);
                              setRejectReason("");
                            }}
                            disabled={isVerifying}
                            className="px-4 py-2 border border-red-300 bg-red-50 text-red-700 font-bold text-xs rounded-lg hover:bg-red-100 transition flex items-center space-x-1.5 cursor-pointer"
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
                                const commission = item.paidAmount * 0.10;
                                setPayoutAmount(String(item.paidAmount - commission));
                              }
                            }}
                            disabled={isVerifying}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
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

          {/* Tab Contents: Escrow Held Bookings */}
          {activeTab === "escrow" && (
            <div className="space-y-4">
              {isLoadingEscrow ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving Escrow held bookings...</span>
                </div>
              ) : escrowBookingsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-xl">
                  No verified bookings currently held in Escrow.
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {escrowBookingsList.map((item: any) => (
                    <div key={item.id} className="p-4 border border-border-custom bg-bg-secondary/30 rounded-xl text-xs space-y-3 hover:bg-bg-secondary/60 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-custom pb-2">
                        <div>
                          <span className="font-bold text-text-primary font-mono text-sm block">Booking Ref: {item.id}</span>
                          <span className="text-[11px] text-text-light">Confirmed: {new Date(item.updatedAt || item.createdAt).toLocaleString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                          item.isFullyDisbursed
                            ? "bg-gray-100 text-gray-700 border border-gray-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}>
                          {item.isFullyDisbursed ? "FULLY DISBURSED" : "HELD IN ESCROW"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-secondary">
                        <div>
                          <p className="text-text-light text-[10px] font-bold uppercase">HOST USER</p>
                          <p className="font-bold text-text-primary">{item.hostUser?.fullName || "Unknown Vendor"}</p>
                          <p className="text-[11px] font-mono">{item.hostUser?.email}</p>
                        </div>
                        <div>
                          <p className="text-text-light text-[10px] font-bold uppercase">FINANCIAL BREAKDOWN</p>
                          <p className="text-[11px]">Paid Amount: <span className="font-bold text-text-primary">BDT {item.paidAmount?.toLocaleString()}</span></p>
                          <p className="text-[11px]">Net Host Share: <span className="font-bold text-emerald-600">BDT {item.netHostShare?.toLocaleString()}</span></p>
                          <p className="text-[11px]">Remaining Due: <span className="font-bold text-amber-600">BDT {item.remainingDisbursalDue?.toLocaleString()}</span></p>
                        </div>
                      </div>

                      {!item.isFullyDisbursed && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectBookingForDisbursal(item)}
                            className="px-4 py-2 bg-theme-primary text-white font-bold text-xs rounded-lg hover:bg-opacity-95 transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
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

          {/* Tab Contents: Payouts */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              {isLoadingPayouts ? (
                <div className="flex items-center justify-center py-16 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
                  <span>Retrieving payouts ledger...</span>
                </div>
              ) : payoutsList.length === 0 ? (
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-xl">
                  No payout transactions logged in system registry.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {payoutsList.map((payout: any) => (
                    <div key={payout.id} className="p-4 border border-border-custom bg-bg-secondary/35 rounded-xl text-xs space-y-1.5 text-text-secondary hover:bg-bg-secondary/60 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-text-primary font-mono text-sm">Txn Ref: {payout.id}</span>
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 tracking-wide text-[9px] font-bold rounded-full uppercase">DISBURSED</span>
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
                <div className="text-center py-12 text-text-light font-bold text-xs italic border border-dashed border-border-custom bg-bg-secondary/20 rounded-xl">
                  No platform commission transactions logged.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {commissionsList.map((comm: any) => (
                    <div key={comm.id} className="p-4 border border-border-custom bg-bg-secondary/35 rounded-xl text-xs space-y-1.5 text-text-secondary hover:bg-bg-secondary/60 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-text-primary font-mono text-sm">Txn Ref: {comm.id}</span>
                        <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 tracking-wide text-[9px] font-bold rounded-full uppercase">COMMISSION REVENUE</span>
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

      {/* Rejection Reason Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom p-6 max-w-md w-full rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary">Reject bKash Payment Submission</h3>
            <p className="text-xs text-text-light">Provide a reason for rejecting this payment submission (e.g. Transaction ID invalid or funds not received):</p>
            
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. TrxID 8K2HJX9 not found in OrbitX bKash statement."
              className="w-full p-3 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
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
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition"
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
