"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPayoutsQuery,
  useReleasePayoutMutation,
} from "@/redux/api/admin/adminApi";
import { Landmark, Loader2, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminPayoutsPage() {
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

  // Mutations
  const [releasePayout, { isLoading: isReleasing }] = useReleasePayoutMutation();

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

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Payout Authorization</h1>
        <p className="text-sm text-text-light mt-1">Settle net earnings payments directly to vendor host bank accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout release form (Col 1) */}
        <form onSubmit={handleReleasePayoutSubmit} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            Authorize Settlement Payout
          </h3>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Host User ID *</label>
            <input
              type="text"
              required
              placeholder="Paste vendor user id"
              value={payoutHostId}
              onChange={(e) => setPayoutHostId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Amount (BDT) *</label>
            <input
              type="number"
              required
              placeholder="Net sum (90% of checkout deposit)"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Reference Booking ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. booking-uuid"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
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

        {/* Payout records list (Col 2) */}
        <div className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            Settled Payout Disbursals Log
          </h3>

          {isLoadingPayouts ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading payout records...</span>
            </div>
          ) : payoutsList.length === 0 ? (
            <div className="text-center py-8 text-text-light font-bold text-xs italic border border-dashed border-border-custom rounded-none bg-bg-secondary/20">
              No payout transactions logged.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {payoutsList.map((payout: any) => (
                <div key={payout.id} className="p-4 border border-border-custom bg-bg-secondary/30 rounded-none text-xs space-y-1 text-text-secondary">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-text-primary font-mono text-sm">Txn Ref: {payout.id}</span>
                    <span className="bg-theme-primary/10 border border-theme-primary/20 text-theme-primary px-2 py-0.5 tracking-wide text-[9px] font-bold rounded-none">PAYOUT</span>
                  </div>
                  <p>Recipient Host ID: <span className="font-mono">{payout.receiverId}</span></p>
                  <p>Amount Transferred: <span className="font-bold text-theme-secondary">BDT {payout.amount}</span></p>
                  <p>Reference ID: <span className="font-mono">{payout.referenceId}</span></p>
                  <p className="text-[10px] text-text-light">Cleared on: {new Date(payout.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
