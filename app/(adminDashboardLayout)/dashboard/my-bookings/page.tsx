"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetBookingsByUserQuery, useCancelBookingMutation } from "@/redux/api/booking/bookingApi";
import { 
  ShoppingBag, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileDown, 
  Calendar, 
  MapPin, 
  Ticket,
  Search,
  Copy,
  ArrowRight,
  Trash2,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function MyBookingsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const { data: bookingsResponse, isLoading: isLoadingBookings, refetch: refetchBookings } = useGetBookingsByUserQuery(undefined, {
    skip: !user,
  });
  const allBookings = bookingsResponse?.data || [];

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const getAbsoluteVoucherUrl = (relativeUrl: string) => {
    if (!relativeUrl) return "#";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const domainBase = apiBase.replace("/api/v1", "");
    return `${domainBase}${relativeUrl}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;

    try {
      toast.loading("Processing booking cancellation...", { id: "cancel-b" });
      const res = await cancelBooking(cancellingBookingId).unwrap();
      toast.success(res?.message || "Booking cancelled successfully!", { id: "cancel-b" });
      setCancellingBookingId(null);
      refetchBookings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel booking.", { id: "cancel-b" });
    }
  };

  // Metrics
  const pendingCount = allBookings.filter((b: any) => b.bookingStatus === "PENDING" || b.paymentStatus === "PENDING").length;
  const confirmedCount = allBookings.filter((b: any) => b.bookingStatus === "CONFIRMED").length;
  const cancelledCount = allBookings.filter((b: any) => b.bookingStatus === "CANCELLED").length;

  // Filter logic
  const filteredBookings = allBookings.filter((b: any) => {
    let matchesStatus = true;
    if (activeTab === "CONFIRMED") matchesStatus = b.bookingStatus === "CONFIRMED";
    else if (activeTab === "CANCELLED") matchesStatus = b.bookingStatus === "CANCELLED";
    else if (activeTab === "PENDING") matchesStatus = b.bookingStatus === "PENDING" || b.paymentStatus === "PENDING";

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const title = (b.package?.title || b.hotel?.name || "").toLowerCase();
      const dest = (b.package?.destination || "").toLowerCase();
      const id = b.id.toLowerCase();
      const txn = (b.paymentTxnId || "").toLowerCase();
      matchesSearch = title.includes(q) || dest.includes(q) || id.includes(q) || txn.includes(q);
    }

    return matchesStatus && matchesSearch;
  });

  const formatDateWithTime = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateOnly = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 min-h-[85vh] space-y-6">
      
      {/* Page Title & Subtitle */}
      <div className="border-b border-border-custom pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">My Bookings</h1>
          <p className="text-xs text-text-light mt-1">Manage your active tour packages, stay check-in schedules, and travel vouchers.</p>
        </div>
        
        {/* Search Input Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-light" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary transition"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-border-custom pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "ALL"
              ? "bg-theme-primary text-white"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>All ({allBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "PENDING"
              ? "bg-amber-600 text-white"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Pending Verification ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("CONFIRMED")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "CONFIRMED"
              ? "bg-emerald-600 text-white"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Confirmed ({confirmedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("CANCELLED")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "CANCELLED"
              ? "bg-red-600 text-white"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>Cancelled ({cancelledCount})</span>
        </button>
      </div>

      {/* Main 2-Column Cards Grid */}
      {isLoadingBookings ? (
        <div className="flex items-center justify-center py-20 text-text-secondary space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
          <span className="text-xs">Loading bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary rounded-2xl space-y-2">
          <ShoppingBag className="h-10 w-10 text-text-light mx-auto" />
          <h3 className="text-sm font-semibold text-text-primary">No Bookings Found</h3>
          <p className="text-xs text-text-light">You have no travel bookings matching this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b: any) => {
            const isConfirmed = b.bookingStatus === "CONFIRMED";
            const isCancelled = b.bookingStatus === "CANCELLED";
            const isPendingVerifying = b.bookingStatus === "PENDING" || b.paymentStatus === "PENDING";
            const isTour = !!b.package;

            const title = b.package?.title || b.hotel?.name || "Stay Booking";
            const coverImage = b.package?.inclusions?.coverImage || b.hotel?.images?.[0] || "/images/hotel-placeholder.jpg";
            const destination = b.package?.destination || b.hotel?.location || "Bangladesh";

            return (
              <div
                key={b.id}
                className="border border-border-custom bg-bg-primary rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Image */}
                  <div className="relative h-40 bg-bg-secondary overflow-hidden">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {isConfirmed && (
                        <span className="bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>CONFIRMED</span>
                        </span>
                      )}
                      {isPendingVerifying && (
                        <span className="bg-amber-600 text-white px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs animate-pulse">
                          <Clock className="h-3 w-3" />
                          <span>PENDING VERIFICATION</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                          <XCircle className="h-3 w-3" />
                          <span>CANCELLED</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Location Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                      <span className="text-[10px] font-mono text-white/80 block">REF: {b.id.slice(0, 8)}</span>
                      <h3 className="text-base font-semibold line-clamp-1">{title}</h3>
                      <p className="text-xs text-white/90 flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>{destination}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    
                    {/* Check-In / Tour Date & Time Schedule Box */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-bg-secondary/40 p-3 rounded-xl border border-border-custom/50">
                      {isTour ? (
                        <>
                          <div>
                            <span className="text-[10px] text-text-light font-medium block">Tour Start Date & Time</span>
                            <span className="font-semibold text-text-primary block">
                              {formatDateWithTime(b.package.startDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-light font-medium block">Tour End Date & Time</span>
                            <span className="font-semibold text-text-primary block">
                              {formatDateWithTime(b.package.endDate)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[10px] text-text-light font-medium block">Check-In Date</span>
                            <span className="font-semibold text-text-primary block">
                              {formatDateOnly(b.checkInDate || b.createdAt)} (12:00 PM)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-light font-medium block">Check-Out Date</span>
                            <span className="font-semibold text-text-primary block">
                              {formatDateOnly(b.checkOutDate || b.createdAt)} (11:00 AM)
                            </span>
                          </div>
                        </>
                      )}

                      <div className="border-t border-border-custom/40 pt-1.5">
                        <span className="text-[10px] text-text-light font-medium block">Allocation</span>
                        <span className="font-semibold text-text-primary">
                          {isTour ? `${b.seatsBooked} Reserved Seat(s)` : `${b.roomQuantity || 1} Hotel Room(s)`}
                        </span>
                      </div>

                      <div className="border-t border-border-custom/40 pt-1.5">
                        <span className="text-[10px] text-text-light font-medium block">Paid Deposit / Price</span>
                        <span className="font-bold text-[#e2136e]">BDT {b.paidAmount?.toLocaleString()}</span>
                        <span className="text-[10px] text-text-light block">(Total: BDT {b.totalAmount?.toLocaleString()})</span>
                      </div>
                    </div>

                    {/* bKash Payment Reference */}
                    {b.paymentTxnId && (
                      <div className="bg-pink-50/40 border border-pink-200/60 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-medium text-text-light block">bKash Sender Reference</span>
                          <span className="font-mono font-semibold text-[#e2136e]">{b.paymentTxnId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(b.paymentTxnId, "bKash Reference")}
                          className="p-1 text-[#e2136e] hover:bg-pink-100/60 rounded-md transition cursor-pointer"
                          title="Copy Transaction ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-bg-secondary/30 border-t border-border-custom flex items-center justify-between gap-2">
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setCancellingBookingId(b.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 font-semibold text-xs rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {isConfirmed && b.voucherUrl && (
                    <a
                      href={getAbsoluteVoucherUrl(b.voucherUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-theme-primary text-white font-semibold text-xs py-1.5 px-3.5 rounded-lg hover:bg-opacity-95 transition flex items-center space-x-1 shadow-xs cursor-pointer ml-auto"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>PDF Voucher</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom p-6 max-w-sm w-full rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">Confirm Cancellation</h3>
            <p className="text-xs text-text-light leading-relaxed">
              Are you sure you want to cancel booking <span className="font-mono font-bold text-text-primary">Ref: {cancellingBookingId.slice(0, 8)}</span>?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBookingId(null)}
                className="px-3 py-1.5 border border-border-custom text-text-secondary text-xs font-semibold rounded-lg hover:bg-bg-secondary"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
