"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useGetHotelByIdQuery } from "@/redux/api/hotel/hotelApi";
import { useCreateBookingMutation, usePayBookingMutation } from "@/redux/api/booking/bookingApi";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, ChevronRight, FileDown, Lock, Calendar, Bed, User } from "lucide-react";
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

  // Payment UI states
  const [checkoutStep, setCheckoutStep] = useState<"summary" | "pay_simulate" | "success">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");
  const [walletNumber, setWalletNumber] = useState("01700000000");
  const [pin, setPin] = useState("1234");
  
  // Success receipt states
  const [completedBooking, setCompletedBooking] = useState<{
    id: string;
    paymentTxnId: string;
    paidAmount: number;
    voucherUrl: string;
    bookingStatus: string;
  } | null>(null);

  useEffect(() => {
    if (walletNumber === "") {
      setWalletNumber(paymentMethod === "bkash" ? "01700000000" : "01800000000");
    }
  }, [paymentMethod, walletNumber]);

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

  const handleStartPayment = (method: "bkash" | "nagad") => {
    setPaymentMethod(method);
    setWalletNumber(method === "bkash" ? "01700000000" : "01800000000");
    setCheckoutStep("pay_simulate");
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletNumber || !pin) {
      toast.error("Please enter your wallet account number and PIN code.");
      return;
    }

    if (isHotel) {
      try {
        toast.loading("Initiating stay reservation lock...", { id: "checkout" });
        const bookingRes = await createBookingApi({
          hotelId,
          roomId,
          roomQuantity: quantity,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }).unwrap();

        const bookingId = bookingRes.data.id;

        toast.loading("Authenticating secure sandbox payment...", { id: "checkout" });
        const paymentRes = await payBookingApi({
          bookingId,
          body: { paymentMethod },
        }).unwrap();

        toast.success("Stay booked & locked successfully!", { id: "checkout" });
        
        setCompletedBooking(paymentRes.data);
        setCheckoutStep("success");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to process checkout stays transaction.", { id: "checkout" });
      }
    } else {
      // Live tour package booking workflow
      try {
        toast.loading("Initiating seat lock booking...", { id: "checkout" });
        const bookingRes = await createBookingApi({
          packageId,
          seatsBooked: seats,
        }).unwrap();

        const bookingId = bookingRes.data.id;

        toast.loading("Authenticating secure sandbox payment...", { id: "checkout" });
        const paymentRes = await payBookingApi({
          bookingId,
          body: { paymentMethod },
        }).unwrap();

        toast.success("Payment checkout completed successfully!", { id: "checkout" });
        
        setCompletedBooking(paymentRes.data);
        setCheckoutStep("success");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to process checkout transaction.", { id: "checkout" });
      }
    }
  };

  const getAbsoluteVoucherUrl = (relativeUrl: string) => {
    if (!relativeUrl) return "#";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const domainBase = apiBase.replace("/api/v1", "");
    return `${domainBase}${relativeUrl}`;
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 min-h-[80vh]">
      
      {/* Title */}
      <div className="mb-10 text-center max-w-xl mx-auto print:hidden">
        <h1 className="text-3xl font-semibold text-text-primary tracking-wide">Checkout Secure Gateway</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {isHotel ? "Secure your hotel room stay reservation." : "Lock in your booking seats deposit."}
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 print:block print:max-w-xl print-receipt-container">
        
        {/* Left Side: Steps / Payment Simulator Forms */}
        <div className="md:col-span-3 space-y-6 print:w-full">
          
          {checkoutStep === "summary" && (
            <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
              <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
                Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* bKash Selection */}
                <button
                  type="button"
                  onClick={() => handleStartPayment("bkash")}
                  className="flex flex-col items-center justify-center p-6 border border-border-custom hover:border-theme-primary bg-bg-secondary/40 hover:bg-bg-secondary transition rounded-none cursor-pointer group"
                >
                  <div className="text-xl font-black text-[#e2136e] group-hover:scale-105 transition-transform duration-300">
                    bKash Checkout
                  </div>
                  <span className="text-[10px] text-text-light font-bold mt-2">MFS Instant Pay</span>
                </button>
 
                {/* Nagad Selection */}
                <button
                  type="button"
                  onClick={() => handleStartPayment("nagad")}
                  className="flex flex-col items-center justify-center p-6 border border-border-custom hover:border-theme-primary bg-bg-secondary/40 hover:bg-bg-secondary transition rounded-none cursor-pointer group"
                >
                  <div className="text-xl font-black text-[#f15a22] group-hover:scale-105 transition-transform duration-300">
                    Nagad Checkout
                  </div>
                  <span className="text-[10px] text-text-light font-bold mt-2">MFS Instant Pay</span>
                </button>
 
              </div>
              
              <p className="text-[10px] text-text-light text-center">
                Transactions are secured under the OrbitX Travel checkout encryption guidelines.
              </p>
            </div>
          )}

          {checkoutStep === "pay_simulate" && (
            <form onSubmit={handleProcessCheckout} className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none animate-in fade-in duration-200">
              
              {/* Payment Branding Banner */}
              <div className={`p-4 text-center font-bold text-white text-lg rounded-none ${ paymentMethod === "bkash" ? "bg-[#e2136e]" : "bg-[#f15a22]" }`}>
                {paymentMethod.toUpperCase() } SANDBOX GATEWAY
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5">
                    {paymentMethod.toUpperCase()} Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5">
                    4-Digit Secret PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-custom flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("summary")}
                  className="px-5 py-2.5 bg-bg-secondary border border-border-custom text-text-secondary font-bold text-xs rounded-none hover:bg-opacity-80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isPaying}
                  className="px-6 py-2.5 bg-btn-primary text-btn-text-primary font-bold text-xs rounded-none hover:bg-opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
                >
                  {(isCreating || isPaying) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay BDT {totalDepositDue}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {checkoutStep === "success" && completedBooking && (
            <div className="border border-border-custom bg-bg-primary p-8 space-y-6 print:p-4 print:space-y-3 text-center rounded-none animate-in zoom-in-95 duration-300">
              
              {/* Print-Only Brand Header */}
              <div className="hidden print:block text-center border-b border-border-custom pb-4 mb-4">
                <h2 className="text-2xl font-black text-theme-primary tracking-widest uppercase font-title">
                  OrbitX Travel
                </h2>
                <p className="text-[9px] text-text-light font-bold uppercase tracking-wider mt-1">
                  Stay Booking Confirmation Voucher
                </p>
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-primary">Payment Confirmed</h3>
                <p className="text-xs text-text-light font-mono">Receipt ID: {completedBooking.id}</p>
              </div>

              <div className="bg-bg-secondary border border-border-custom p-6 print:p-3 text-left space-y-3.5 print:space-y-2 max-w-md mx-auto text-xs text-text-secondary font-semibold">
                {isHotel ? (
                  <>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Hotel Property:</span>
                      <span className="text-text-primary">{hotel?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Room Type:</span>
                      <span className="text-text-primary">{selectedRoom?.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Room Quantity:</span>
                      <span className="text-text-primary">{quantity} Room(s)</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Stay Duration:</span>
                      <span className="text-text-primary">{nights} Night(s)</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Check-in Date:</span>
                      <span className="text-text-primary">{checkIn}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Checkout Date:</span>
                      <span className="text-text-primary">{checkOut}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Guests Count:</span>
                      <span className="text-text-primary">{adults} Adult(s), {children} Child(ren)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Tour Package:</span>
                      <span className="text-text-primary">{pkg?.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Destination:</span>
                      <span className="text-text-primary">{pkg?.destination}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-custom pb-2">
                      <span>Seats Booked:</span>
                      <span className="text-text-primary">{seats} Seat(s)</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-b border-border-custom pb-2 text-theme-secondary font-bold">
                  <span>Amount Paid via {paymentMethod.toUpperCase()}:</span>
                  <span>BDT {completedBooking.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-light font-mono text-[10px]">
                  <span>Txn ID:</span>
                  <span>{completedBooking.paymentTxnId}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print-receipt-buttons">
                {!isHotel && completedBooking.voucherUrl && (
                  <a
                    href={getAbsoluteVoucherUrl(completedBooking.voucherUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-theme-primary text-white font-bold py-2.5 px-6 text-xs rounded-none hover:bg-opacity-95 transition flex items-center justify-center space-x-2"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download PDF Voucher</span>
                  </a>
                )}
                {isHotel && (
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.print();
                      }
                    }}
                    className="w-full sm:w-auto bg-theme-primary text-white font-bold py-2.5 px-6 text-xs rounded-none hover:bg-opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Print Stay Confirmation</span>
                  </button>
                )}
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-bg-secondary border border-border-custom text-text-secondary font-bold py-2.5 px-6 text-xs rounded-none hover:bg-opacity-80 transition text-center"
                >
                  Back to Portal
                </Link>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Order summary layout */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
            <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
              Order Summary
            </h3>
            
            {isHotel ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-light font-bold block">PROPERTY STAY</span>
                  <h4 className="text-sm font-bold text-text-primary leading-tight">{hotel?.name}</h4>
                  <p className="text-[11px] text-text-light">{hotel?.address}</p>
                </div>
                
                <div className="border-t border-border-custom pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
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
                
                <div className="border-t border-border-custom pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
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
            <div className="border-t border-border-custom pt-4 space-y-2.5 text-xs text-text-secondary font-semibold">
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
              
              <div className="flex justify-between text-sm font-bold text-text-primary border-t border-border-custom pt-2.5">
                <span>{isHotel ? "Total Due Now" : "Amount Due Now"}</span>
                <span className="text-theme-secondary">BDT {totalDepositDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-[10px] text-text-light leading-normal bg-bg-secondary p-3 border border-border-custom print:hidden">
              <Lock className="h-4 w-4 text-theme-primary shrink-0 mt-0.5" />
              <span>
                Checkout payments are protected under SSL-encrypted policies. Simulated sandbox is active for testing credentials.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
