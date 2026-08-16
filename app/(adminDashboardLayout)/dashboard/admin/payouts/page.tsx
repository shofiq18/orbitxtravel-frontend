"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPayoutsQuery,
  useReleasePayoutMutation,
  useGetAllAdvanceRequestsQuery,
  useInspectAndDisburseAdvanceMutation,
  useGetMilestoneDisbursalsQuery,
  useDisburseFinalMilestoneMutation,
} from "@/redux/api/admin/adminApi";
import {
  Landmark,
  Loader2,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  UserCheck,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminPayoutsPage() {
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

  const { data: advanceRequestsResponse, isLoading: isLoadingAdvance, refetch: refetchAdvance } = useGetAllAdvanceRequestsQuery(undefined);
  const advanceRequestsList = advanceRequestsResponse?.data || [];

  const { data: milestonesResponse, isLoading: isLoadingMilestones, refetch: refetchMilestones } = useGetMilestoneDisbursalsQuery(undefined);
  const tourMilestones = milestonesResponse?.data?.tourMilestones || [];
  const hotelMilestones = milestonesResponse?.data?.hotelMilestones || [];

  // Mutations
  const [releasePayout, { isLoading: isReleasing }] = useReleasePayoutMutation();
  const [inspectAndDisburseAdvance, { isLoading: isDisbursingAdvance }] = useInspectAndDisburseAdvanceMutation();
  const [disburseFinalMilestone, { isLoading: isDisbursingMilestone }] = useDisburseFinalMilestoneMutation();

  // Inspection Modal States
  const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null);

  // Payout Form States
  const [payoutHostId, setPayoutHostId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRef, setPayoutRef] = useState("");

  const pendingAdvancesCount = advanceRequestsList.filter((r: any) => r.status === "PENDING").length;
  const readyTourMilestonesCount = tourMilestones.filter((m: any) => !m.isFinalDisbursed && m.netRemaining > 0).length;
  const readyHotelMilestonesCount = hotelMilestones.filter((m: any) => !m.isFinalDisbursed && m.netRemaining > 0).length;

  const handleInspectDisburseSubmit = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedAdvance) return;

    try {
      await inspectAndDisburseAdvance({
        id: selectedAdvance.id,
        body: {
          status,
          adminNote,
          disbursedAmount: selectedAdvance.requestedAmount,
        },
      }).unwrap();

      toast.success(status === "APPROVED" ? "Advance payout approved and disbursed!" : "Advance request declined.");
      setSelectedAdvance(null);
      setAdminNote("");
      refetchAdvance();
      refetchPayouts();
      refetchMilestones();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process advance request.");
    }
  };

  const handleDisburseMilestone = async (targetType: "package" | "booking", targetId: string) => {
    setLoadingMilestoneId(targetId);
    try {
      await disburseFinalMilestone({
        targetType,
        targetId,
      }).unwrap();

      toast.success("Final milestone payout disbursed successfully!");
      refetchMilestones();
      refetchPayouts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to disburse milestone payout.");
    } finally {
      setLoadingMilestoneId(null);
    }
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
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to release payout.");
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[85vh] space-y-8">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-theme-primary/20 blur-3xl" />
        <div className="absolute right-40 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>OrbitX Escrow & Settlement Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Payout Authorization & Advance Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verify advance disbursal requests, audit host payout eligibility, and execute milestone payouts for Tour Organizers and Hotel Owners.
            </p>
          </div>

          {/* Quick Metrics Cards Header */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl min-w-[140px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block">Pending Advances</span>
              <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-between">
                <span>{pendingAdvancesCount}</span>
                <Clock className="h-5 w-5 text-amber-400/80" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl min-w-[140px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block">Ready Milestones</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center justify-between">
                <span>{readyTourMilestonesCount + readyHotelMilestonesCount}</span>
                <ShieldCheck className="h-5 w-5 text-emerald-400/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: ADVANCE PAYOUT REQUESTS INSPECTION QUEUE */}
      <div className="border border-border-custom bg-bg-primary rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">
                Advance Payout Verification Queue
              </h2>
              <p className="text-xs text-text-light">
                Inspect upfront expense requests (50% max) submitted by verified hosts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>{pendingAdvancesCount} Pending Review</span>
            </span>
          </div>
        </div>

        {isLoadingAdvance ? (
          <div className="flex items-center justify-center py-12 text-xs text-text-light space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
            <span>Loading advance payout requests...</span>
          </div>
        ) : advanceRequestsList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-custom rounded-2xl bg-bg-secondary/20 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-text-primary">Queue Is Clear</h3>
            <p className="text-xs text-text-light">There are no pending advance requests requiring admin verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-custom rounded-2xl shadow-2xs bg-bg-primary">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-custom bg-bg-secondary/80 text-text-light uppercase tracking-wider text-[10px]">
                  <th className="p-4">Host Vendor</th>
                  <th className="p-4">Target Asset / Property</th>
                  <th className="p-4">Advance Requested</th>
                  <th className="p-4">Expense Description</th>
                  <th className="p-4">Payout Account Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Inspection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/60 text-text-primary">
                {advanceRequestsList.map((req: any) => {
                  const targetName = req.package?.title || req.hotel?.name || "General Workspace";
                  const payout = req.user?.payoutDetails || {};
                  const isPending = req.status === "PENDING";
                  const isDisbursed = req.status === "DISBURSED";

                  return (
                    <tr key={req.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text-primary text-sm">{req.user?.fullName || "Host"}</div>
                        <div className="text-[11px] text-text-light font-mono">{req.user?.email}</div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-theme-primary/10 text-theme-primary border border-theme-primary/20 rounded-md">
                          {req.userRole === "tour_organizer" ? "Tour Organizer" : "Hotel Owner"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-text-primary">{targetName}</div>
                        <div className="text-[11px] text-text-light">
                          {req.package ? `Destination: ${req.package.destination}` : `Address: ${req.hotel?.address}`}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-emerald-600 text-sm">
                          BDT {req.requestedAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{req.reason}</p>
                      </td>
                      <td className="p-4 font-medium text-text-primary">
                        <div className="font-bold text-xs">{payout.bkashNumber ? "bKash" : payout.nagadNumber ? "Nagad" : payout.bankName || "Bank Transfer"}</div>
                        <div className="text-[11px] text-text-light font-mono bg-bg-secondary px-2 py-0.5 rounded border border-border-custom/50 inline-block mt-0.5">
                          {payout.bkashNumber || payout.nagadNumber || payout.accountNumber || "Not set"}
                        </div>
                      </td>
                      <td className="p-4">
                        {isPending && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isDisbursed && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Disbursed</span>
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>Declined</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAdvance(req)}
                            className="px-4 py-2 bg-gradient-to-r from-theme-primary to-indigo-600 hover:from-indigo-600 hover:to-theme-primary text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Inspect & Disburse</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-text-light font-semibold italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: MILESTONE-BASED DISBURSALS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">
                Milestone Escrow Disbursals
              </h2>
              <p className="text-xs text-text-light mt-0.5">
                Automatically triggered when Tour departure date or Hotel guest check-in date has passed.
              </p>
            </div>
          </div>
        </div>

        {isLoadingMilestones ? (
          <div className="flex items-center justify-center py-12 text-xs text-text-light space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
            <span>Evaluating milestone schedules...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 2A: TOUR DEPARTURE MILESTONES */}
            <div className="border border-border-custom bg-bg-primary p-6 rounded-3xl space-y-5 shadow-sm">
              <div className="flex justify-between items-center border-b border-border-custom pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-extrabold text-text-primary">
                    Tour Departures ({tourMilestones.length})
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Tour Packages
                </span>
              </div>

              {tourMilestones.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-light border border-dashed border-border-custom rounded-2xl bg-bg-secondary/20">
                  No active tour departure milestones reached.
                </div>
              ) : (
                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {tourMilestones.map((m: any) => (
                    <div key={m.id} className="border border-border-custom/80 bg-bg-secondary/30 p-5 rounded-2xl space-y-4 hover:border-theme-primary/40 transition">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-text-primary text-base">{m.title}</h4>
                          <p className="text-xs text-text-light font-medium">
                            Organizer: <span className="text-text-primary font-bold">{m.organizer?.fullName}</span> ({m.organizer?.email})
                          </p>
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Departed: {new Date(m.startDate).toLocaleString()}</span>
                          </div>
                        </div>
                        {m.isFinalDisbursed ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            Fully Disbursed
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            Ready for Disbursal
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 bg-bg-primary p-3 border border-border-custom rounded-xl text-center text-xs">
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Total Escrow</span>
                          <span className="font-extrabold text-text-primary text-xs">BDT {m.totalEscrow?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Advance Paid</span>
                          <span className="font-extrabold text-amber-600 text-xs">BDT {m.advanceDisbursed?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Net Remaining</span>
                          <span className="font-black text-emerald-600 text-sm">BDT {m.netRemaining?.toLocaleString()}</span>
                        </div>
                      </div>

                      {!m.isFinalDisbursed && (
                        <button
                          type="button"
                          disabled={loadingMilestoneId === m.id || m.netRemaining <= 0}
                          onClick={() => handleDisburseMilestone("package", m.id)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {loadingMilestoneId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          <span>Disburse Remaining Escrow (BDT {m.netRemaining?.toLocaleString()})</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2B: HOTEL CHECK-IN MILESTONES */}
            <div className="border border-border-custom bg-bg-primary p-6 rounded-3xl space-y-5 shadow-sm">
              <div className="flex justify-between items-center border-b border-border-custom pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-text-primary">
                    Hotel Check-Ins ({hotelMilestones.length})
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Hotel Rooms
                </span>
              </div>

              {hotelMilestones.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-light border border-dashed border-border-custom rounded-2xl bg-bg-secondary/20">
                  No hotel check-in milestones reached.
                </div>
              ) : (
                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {hotelMilestones.map((m: any) => (
                    <div key={m.id} className="border border-border-custom/80 bg-bg-secondary/30 p-5 rounded-2xl space-y-4 hover:border-theme-primary/40 transition">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-text-primary text-base">{m.hotelName} — {m.roomType}</h4>
                          <p className="text-xs text-text-light font-medium">
                            Hotel Owner: <span className="text-text-primary font-bold">{m.owner?.fullName}</span> ({m.owner?.email})
                          </p>
                          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Check-in Date: {new Date(m.checkInDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {m.isFinalDisbursed ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            Fully Disbursed
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            Ready for Disbursal
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 bg-bg-primary p-3 border border-border-custom rounded-xl text-center text-xs">
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Total Escrow</span>
                          <span className="font-extrabold text-text-primary text-xs">BDT {m.totalEscrow?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Advance Paid</span>
                          <span className="font-extrabold text-amber-600 text-xs">BDT {m.advanceDisbursed?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase tracking-wider">Net Remaining</span>
                          <span className="font-black text-indigo-600 text-sm">BDT {m.netRemaining?.toLocaleString()}</span>
                        </div>
                      </div>

                      {!m.isFinalDisbursed && (
                        <button
                          type="button"
                          disabled={loadingMilestoneId === m.id || m.netRemaining <= 0}
                          onClick={() => handleDisburseMilestone("booking", m.id)}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {loadingMilestoneId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          <span>Disburse Check-In Escrow (BDT {m.netRemaining?.toLocaleString()})</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* SECTION 3: MANUAL DISBURSAL FORM & PAYOUT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout release form (Col 1) */}
        <form onSubmit={handleReleasePayoutSubmit} className="border border-border-custom bg-bg-primary p-6 space-y-5 rounded-3xl h-fit shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border-custom pb-3">
            <div className="p-2.5 bg-theme-primary/10 text-theme-primary rounded-xl">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-primary tracking-wide">
                Manual Settlement Release
              </h3>
              <p className="text-[11px] text-text-light">Execute direct manual payouts</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary mb-1.5 uppercase tracking-wider">Host User UUID *</label>
            <input
              type="text"
              required
              placeholder="Paste vendor user UUID"
              value={payoutHostId}
              onChange={(e) => setPayoutHostId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary mb-1.5 uppercase tracking-wider">Disbursal Amount (BDT) *</label>
            <input
              type="number"
              required
              placeholder="Net sum to transfer"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono font-extrabold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary mb-1.5 uppercase tracking-wider">Reference Booking / Note *</label>
            <input
              type="text"
              required
              placeholder="e.g. booking-uuid or manual settlement"
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

        {/* Payout records list (Col 2) */}
        <div className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 space-y-5 rounded-3xl h-fit shadow-sm">
          <div className="flex justify-between items-center border-b border-border-custom pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary tracking-wide">
                  Settled Payout Disbursals Ledger
                </h3>
                <p className="text-[11px] text-text-light">Completed transactions log</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-text-light">{payoutsList.length} Settled Records</span>
          </div>

          {isLoadingPayouts ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-theme-primary" />
              <span>Loading payout records...</span>
            </div>
          ) : payoutsList.length === 0 ? (
            <div className="text-center py-10 text-text-light font-bold text-xs italic border border-dashed border-border-custom rounded-2xl bg-bg-secondary/20">
              No payout transactions logged in system registry.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {payoutsList.map((payout: any) => (
                <div key={payout.id} className="p-4 border border-border-custom bg-bg-secondary/40 rounded-2xl text-xs space-y-2 text-text-secondary hover:border-theme-primary/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-text-primary font-mono text-xs">Txn ID: {payout.id}</span>
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                      HOST PAYOUT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-text-light text-[9px] font-bold block uppercase">Recipient Host ID</span>
                      <span className="font-mono text-text-primary font-bold truncate block">{payout.receiverId}</span>
                    </div>
                    <div>
                      <span className="text-text-light text-[9px] font-bold block uppercase">Transferred Amount</span>
                      <span className="font-black text-emerald-600 text-xs">BDT {payout.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-light pt-1 border-t border-border-custom/40">
                    <span className="font-mono">Ref: {payout.referenceId}</span>
                    <span>Cleared: {new Date(payout.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedAdvance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom p-6 max-w-lg w-full rounded-3xl space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-border-custom pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">AUTHENTICITY INSPECTION</span>
                  <h3 className="text-lg font-extrabold text-text-primary">Advance Payout Verification</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdvance(null)}
                className="text-text-light hover:text-text-primary text-base font-extrabold p-1 hover:bg-bg-secondary rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-secondary bg-bg-secondary/60 p-4 rounded-2xl border border-border-custom">
              <div className="flex justify-between items-center">
                <span className="text-text-light font-bold">Requesting Host:</span>
                <span className="font-extrabold text-text-primary">{selectedAdvance.user?.fullName} ({selectedAdvance.userRole})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light font-bold">Target Asset:</span>
                <span className="font-extrabold text-text-primary">{selectedAdvance.package?.title || selectedAdvance.hotel?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-b border-border-custom/60 py-2 my-1">
                <span className="text-text-light font-bold">Requested Advance:</span>
                <span className="font-black text-emerald-600 text-base">BDT {selectedAdvance.requestedAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light font-bold">Host Payout Method:</span>
                <span className="font-extrabold text-text-primary">
                  {selectedAdvance.user?.payoutDetails?.bkashNumber ? "bKash" : selectedAdvance.user?.payoutDetails?.bankName || "Bank Transfer"}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-text-light font-bold font-sans">Account No:</span>
                <span className="bg-bg-primary px-2 py-0.5 rounded border border-border-custom font-extrabold text-text-primary">
                  {selectedAdvance.user?.payoutDetails?.bkashNumber || selectedAdvance.user?.payoutDetails?.accountNumber || "Not specified"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Host Expenses Reason:</span>
              <p className="text-xs text-text-primary p-3 bg-bg-secondary border border-border-custom rounded-2xl leading-relaxed font-medium">
                {selectedAdvance.reason}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Admin Audit Notes / Reference Txn</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional audit notes or transaction reference number..."
                className="w-full p-3 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary transition font-medium"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDisbursingAdvance}
                onClick={() => handleInspectDisburseSubmit("REJECTED")}
                className="px-5 py-2.5 border border-red-200 bg-red-50 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition cursor-pointer"
              >
                Decline Request
              </button>
              <button
                type="button"
                disabled={isDisbursingAdvance}
                onClick={() => handleInspectDisburseSubmit("APPROVED")}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                {isDisbursingAdvance ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Approve & Transfer Money</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
