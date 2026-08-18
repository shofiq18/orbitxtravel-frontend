"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useGetHotelByIdQuery } from "@/redux/api/hotel/hotelApi";
import { useCreateBookingMutation, usePayBookingMutation } from "@/redux/api/booking/bookingApi";
import { Loader2, CheckCircle2, AlertTriangle, FileDown, Lock, Calendar, Bed, User, Copy, Check, ShoppingCart, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = params.packageId as string;
  const isHotel = packageId === "hotel";

  const seats = Number(searchParams.get("seats") || "1");
  const hotelId = searchParams.get("hotelId") || "";
  const roomId = searchParams.get("roomId") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = Number(searchParams.get("adults") || "1");
  const children = Number(searchParams.get("children") || "0");
  const infants = Number(searchParams.get("infants") || "0");
  const quantity = Number(searchParams.get("quantity") || "1");

  // Fetch package details if tour package checkout
  const { data: packageResponse, isLoading: isLoadingPackage, error: packageError } = useGetPackageByIdQuery(packageId, {
    skip: isHotel
  });
  const pkg = packageResponse?.data;

  // Fetch hotel details if stay checkout
  const { data: hotelResponse, isLoading: isLoadingHotel, error: hotelError } = useGetHotelByIdQuery(hotelId, {
    skip: !isHotel || !hotelId
  });
  const hotel = hotelResponse?.data;

  const [createBookingApi, { isLoading: isCreating }] = useCreateBookingMutation();
  const [payBookingApi, { isLoading: isPaying }] = usePayBookingMutation();

  // Payment UI states (bKash is the single active payment method)
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Official OrbitX Payment Receiver Number
  const BKASH_NUMBER = "+8801929654718";

  // Step state
  const [checkoutStep, setCheckoutStep] = useState<"form" | "success">("form");

  // Success receipt state
  const [completedBooking, setCompletedBooking] = useState<{
    id: string;
    paymentTxnId: string;
    paidAmount: number;
    voucherUrl: string;
    bookingStatus: string;
  } | null>(null);

  const handleCopyNumber = (num: string) => {
    const cleanNum = num.replace(/[^0-9]/g, "");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cleanNum);
    }
    setCopiedNumber(num);
    toast.success(`Number ${num} copied to clipboard!`);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const isLoading = isHotel ? isLoadingHotel : isLoadingPackage;
  const isError = isHotel ? (hotelError || !hotel) : (packageError || !pkg);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Setting up checkout parameters...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold text-text-primary">Checkout Error</h3>
        <p className="text-sm text-text-secondary">
          Failed to load checkout parameters. Please return and retry booking.
        </p>
        <Link href="/" className="bg-btn-primary text-btn-text-primary px-6 py-2 text-xs font-bold rounded-none">
          Return to Search
        </Link>
      </div>
    );
  }

  // Calculate pricing splits
  const selectedRoom = hotel?.rooms?.find((r: any) => r.id === roomId) || hotel?.rooms?.[0];
  
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };
  const nights = calculateNights();

  const totalDepositDue = isHotel
    ? (selectedRoom?.b2cPrice || 0) * nights * quantity
    : seats * (pkg?.minimumSeatLockFee || 0);

  const fullPriceDue = isHotel
    ? (selectedRoom?.b2cPrice || 0) * nights * quantity
    : seats * (pkg?.totalPackagePrice || 0);

  const handleProcessCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!senderNumber || !transactionId) {
      toast.error("Please provide your sender bKash mobile number and Transaction ID.");
      return;
    }

    try {
      toast.loading("Creating booking record...", { id: "checkout" });

      // 1. Create booking payload
      const bookingPayload = isHotel
        ? {
            hotelId,
            roomId,
            roomQuantity: quantity,
            checkInDate: checkIn,
            checkOutDate: checkOut,
          }
        : {
            packageId,
            seatsBooked: seats,
          };

      const bookingRes = await createBookingApi(bookingPayload).unwrap();
      const bookingId = bookingRes.data.id;

      // 2. Submit payment information for Admin Verification
      toast.loading("Submitting bKash payment reference for Admin Verification...", { id: "checkout" });

      const payBody = {
        paymentMethod: "bkash",
        senderNumber,
        transactionId,
      };

      const paymentRes = await payBookingApi({
        bookingId,
        body: payBody,
      }).unwrap();

      toast.success("Payment reference submitted! Pending Admin Verification.", { id: "checkout" });
      
      setCompletedBooking(paymentRes.data);
      setCheckoutStep("success");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process booking checkout.", { id: "checkout" });
    }
  };

  const getAbsoluteVoucherUrl = (relativeUrl: string) => {
    if (!relativeUrl) return "#";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const domainBase = apiBase.replace("/api/v1", "");
    return `${domainBase}${relativeUrl}`;
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh]">
      
      {/* Title */}
      <div className="mb-8 text-center max-w-xl mx-auto print:hidden">
        <h1 className="text-3xl font-semibold text-text-primary tracking-wide">Checkout & Payment</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {isHotel ? "Secure your hotel room stay reservation." : "Lock in your booking seats deposit."}
        </p>
      </div>

      {/* 3/2 Grid Split Ratio: Left md:col-span-3, Right md:col-span-2 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 print:block print:max-w-xl print-receipt-container">
        
        {/* Left Side on Desktop (3/5 Ratio), Order 2 on Mobile: Authentic bKash Payment Card */}
        <div className="md:col-span-3 space-y-6 print:w-full order-2 md:order-1">
          
          {checkoutStep === "form" && (
            <div className="space-y-4">
              
              {/* AUTHENTIC BKASH CARD WITH EXACT BKASH PAYMENT PILL HEADER */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="border border-gray-200 bg-white overflow-hidden text-left animate-in fade-in duration-300 shadow-xl rounded-2xl"
              >
                {/* Top Header Banner: Exact bKash Payment Pill Matching Screenshot */}
                <div className="bg-white pt-5 pb-4 px-6 text-center border-b border-gray-200 flex items-center justify-center">
                  <div className="inline-flex items-center space-x-2 border border-[#e2136e] px-7 py-1.5 rounded-full bg-white shadow-xs">
                    <span className="text-2xl font-black tracking-tight">
                      <span className="text-[#e2136e]">b</span>
                      <span className="text-gray-900">Kash</span>
                    </span>
                    <img 
                      src="/bkash-logo-mobile-banking-app-icon-transparent-background-free-png.webp" 
                      alt="bKash Origami Bird"
                      className="h-7 w-auto object-contain inline-block shrink-0"
                    />
                    <span className="text-xl font-semibold text-[#e2136e] tracking-tight">Payment</span>
                  </div>
                </div>

                {/* Merchant & Amount Info Bar */}
                <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 shadow-xs">
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">OrbitX Travel Official</h4>
                      <span className="text-[11px] text-gray-500 font-semibold">{isHotel ? "Hotel Stay Reservation" : "Seats Lock Deposit"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">৳{totalDepositDue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Main bKash Pink Body */}
                <div className="bg-[#e2136e] p-6 space-y-6 text-white">
                  
                  {/* Send Money Number Box */}
                  <div className="border border-white/30 bg-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-white/90 uppercase tracking-wider block">
                        SEND MONEY (PERSONAL NUMBER)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest mt-0.5">
                        {BKASH_NUMBER}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(BKASH_NUMBER)}
                      className="px-4 py-2 bg-white text-[#e2136e] text-xs font-bold rounded-full hover:bg-gray-100 transition flex items-center space-x-1.5 shrink-0 shadow-sm cursor-pointer"
                    >
                      {copiedNumber === BKASH_NUMBER ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedNumber === BKASH_NUMBER ? "Copied!" : "Copy Number"}</span>
                    </button>
                  </div>

                  {/* Input 1: Your bKash Account number */}
                  <div className="space-y-1.5 text-center">
                    <label className="block text-xs font-bold text-white tracking-wide">
                      Your bKash Account number
                    </label>
                    <input
                      type="text"
                      required
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="e.g 01XXXXXXXXX"
                      className="w-full px-4 py-3 text-center text-sm font-bold text-gray-800 bg-white outline-none rounded-xl placeholder:text-gray-400 placeholder:font-bold font-mono shadow-inner border-0"
                    />
                  </div>

                  {/* Input 2: Transaction ID (TrxID) */}
                  <div className="space-y-1.5 text-center">
                    <label className="block text-xs font-bold text-white tracking-wide">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="E.G. 8K2HJX9..."
                      className="w-full px-4 py-3 text-center text-sm font-bold text-gray-800 bg-white uppercase outline-none rounded-xl placeholder:text-gray-400 placeholder:font-bold font-mono shadow-inner border-0"
                    />
                  </div>

                  {/* Verification Note Box */}
                  <div className="bg-[#111625] text-white p-4 rounded-xl flex items-start space-x-3 text-xs border border-white/10 shadow-sm">
                    <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 font-medium text-left">
                      <p className="text-gray-200 leading-snug">* Verification is manual and typically takes 1-4 hours during business hours.</p>
                      <p className="text-amber-400 font-semibold leading-snug">* Keep your Transaction ID (TrxID) safe after sending payment.</p>
                    </div>
                  </div>

                  {/* Terms Subtext */}
                  <p className="text-[10px] text-white/80 text-center font-medium">
                    By clicking on Confirm, you are agreeing to the{" "}
                    <Link href="/terms" target="_blank" className="underline font-bold text-white hover:text-gray-200">
                      terms & conditions
                    </Link>
                  </p>

                </div>

                {/* Bottom Split Action Bar with Light Gray Border Top */}
                <div className="grid grid-cols-2 text-center border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSenderNumber("");
                      setTransactionId("");
                    }}
                    className="py-3.5 bg-[#d1d5db] text-gray-800 font-black text-sm uppercase tracking-wider hover:bg-gray-300 transition cursor-pointer"
                  >
                    CLOSE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcessCheckout()}
                    disabled={isCreating || isPaying || !senderNumber || !transactionId}
                    className="py-3.5 bg-[#e2136e] text-white font-black text-sm uppercase tracking-wider hover:bg-[#c90e60] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {(isCreating || isPaying) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>SUBMITTING...</span>
                      </>
                    ) : (
                      <span>CONFIRM</span>
                    )}
                  </button>
                </div>

              </div>

              <p className="text-[10px] text-text-light text-center pt-2">
                All booking submissions are logged and protected under OrbitX Travel encryption policies.
              </p>
            </div>
          )}

          {checkoutStep === "success" && completedBooking && (
            <div className="border border-gray-200 bg-bg-primary p-8 space-y-6 print:p-4 print:space-y-3 text-center rounded-2xl animate-in zoom-in-95 duration-300">
              
              {/* Verification Status Icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-amber-100/80 rounded-full border border-amber-300">
                  <Clock className="h-12 w-12 text-amber-600 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  PAYMENT VERIFICATION PENDING
                </span>
                <h3 className="text-xl font-bold text-text-primary">Payment Submitted for Verification</h3>
                <p className="text-xs text-text-light font-mono">Booking Ref ID: {completedBooking.id}</p>
                <p className="text-xs text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-200 text-left leading-relaxed">
                  * Admin is reviewing your bKash payment reference. Verification typically takes <strong>1-4 hours</strong> during business hours. Once verified, your status will change to <strong>CONFIRMED</strong> and your PDF voucher will be issued.
                </p>
              </div>

              <div className="bg-bg-secondary border border-gray-200 p-6 print:p-3 text-left space-y-3.5 print:space-y-2 max-w-md mx-auto text-xs text-text-secondary font-semibold rounded-xl">
                {isHotel ? (
                  <>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Hotel Property:</span>
                      <span className="text-text-primary">{hotel?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Room Type:</span>
                      <span className="text-text-primary">{selectedRoom?.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Room Quantity:</span>
                      <span className="text-text-primary">{quantity} Room(s)</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Stay Duration:</span>
                      <span className="text-text-primary">{nights} Night(s)</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Check-in Date:</span>
                      <span className="text-text-primary">{checkIn}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Checkout Date:</span>
                      <span className="text-text-primary">{checkOut}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Guests Count:</span>
                      <span className="text-text-primary">{adults} Adult(s), {children} Child(ren)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Tour Package:</span>
                      <span className="text-text-primary">{pkg?.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Destination:</span>
                      <span className="text-text-primary">{pkg?.destination}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Seats Booked:</span>
                      <span className="text-text-primary">{seats} Seat(s)</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-b border-gray-200 pb-2 text-[#e2136e] font-bold">
                  <span>Amount Submitted via BKASH:</span>
                  <span>BDT {completedBooking.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-light font-mono text-[10px]">
                  <span>Payment Ref / TrxID:</span>
                  <span className="font-bold text-text-primary">{completedBooking.paymentTxnId}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print-receipt-buttons">
                <Link
                  href="/dashboard/profile"
                  className="w-full sm:w-auto bg-theme-primary text-white font-bold py-2.5 px-6 text-xs rounded-xl hover:bg-opacity-95 transition text-center"
                >
                  View My Bookings Status
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-bg-secondary border border-gray-200 text-text-secondary font-bold py-2.5 px-6 text-xs rounded-xl hover:bg-opacity-80 transition text-center"
                >
                  Back to Home
                </Link>
              </div>

            </div>
          )}

        </div>

        {/* Right Side on Desktop (2/5 Ratio), Order 1 on Mobile: Order Summary Layout */}
        <div className="md:col-span-2 space-y-6 order-1 md:order-2">
          <div className="border border-gray-200 bg-bg-primary p-6 space-y-6 rounded-2xl shadow-xs">
            <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-gray-200 pb-2">
              Order Summary
            </h3>
            
            {isHotel ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-light font-bold block">PROPERTY STAY</span>
                  <h4 className="text-sm font-bold text-text-primary leading-tight">{hotel?.name}</h4>
                  <p className="text-[11px] text-text-light">{hotel?.address}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <Bed className="h-4 w-4 text-theme-primary" />
                      <span>{selectedRoom?.type} (x{quantity})</span>
                    </div>
                    <span>BDT {selectedRoom?.b2cPrice?.toLocaleString()} / nt</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 text-theme-primary" />
                      <span>{checkIn} to {checkOut}</span>
                    </div>
                    <span>{nights} night(s)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <User className="h-4 w-4 text-theme-primary" />
                      <span>Guests</span>
                    </div>
                    <span>{adults} Ad, {children} Ch</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-light font-bold block">TOUR PACKAGE</span>
                  <h4 className="text-sm font-bold text-text-primary leading-tight">{pkg?.title}</h4>
                  <p className="text-[11px] text-text-light">{pkg?.destination}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
                  <div className="flex justify-between">
                    <span>Seats selected:</span>
                    <span className="font-bold text-text-primary">{seats} Seat(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure date:</span>
                    <span>{new Date(pkg?.startDate || "").toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing split ledger */}
            <div className="border-t border-gray-200 pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
              <div className="flex justify-between text-text-primary">
                <span>Total Stay/Seats Price:</span>
                <span>BDT {fullPriceDue.toLocaleString()}</span>
              </div>
              
              {!isHotel && (
                <>
                  <div className="flex justify-between">
                    <span>Minimum deposit lock:</span>
                    <span>BDT {totalDepositDue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-text-light">
                    <span>Remaining settled at departure:</span>
                    <span>BDT {(fullPriceDue - totalDepositDue).toLocaleString()}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-sm font-bold text-text-primary border-t border-gray-200 pt-2.5">
                <span>{isHotel ? "Total Due Now" : "Amount Due Now"}</span>
                <span className="text-[#e2136e]">BDT {totalDepositDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-[10px] text-text-light leading-normal bg-bg-secondary p-3 border border-gray-200 rounded-xl print:hidden">
              <Lock className="h-4 w-4 text-[#e2136e] shrink-0 mt-0.5" />
              <span>
                Checkout payments are protected under OrbitX Travel encryption policies. Direct bKash manual payment is active.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
