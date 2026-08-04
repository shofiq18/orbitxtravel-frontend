"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useCreateBookingMutation, usePayBookingMutation } from "@/redux/api/booking/bookingApi";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, ChevronRight, FileDown, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = params.packageId as string;
  const seats = Number(searchParams.get("seats") || "1");

  const { data: packageResponse, isLoading: isLoadingPackage, error: packageError } = useGetPackageByIdQuery(packageId);
  const pkg = packageResponse?.data;

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

  if (isLoadingPackage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Setting up checkout parameters...</span>
        </div>
      </div>
    );
  }

  if (packageError || !pkg) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-text-primary">Checkout Error</h3>
        <p className="text-sm text-text-secondary">
          Failed to load checkout parameters. Please go back to the package detail screen and retry booking.
        </p>
        <Link href="/" className="bg-btn-primary text-btn-text-primary px-6 py-2 text-xs font-bold rounded-none">
          Return to search
        </Link>
      </div>
    );
  }

  const depositPerSeat = pkg.minimumSeatLockFee;
  const totalDepositDue = seats * depositPerSeat;
  const fullPriceDue = seats * pkg.totalPackagePrice;

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

    try {
      // 1. Create Booking
      toast.loading("Initiating seat lock booking...", { id: "checkout" });
      const bookingRes = await createBookingApi({
        packageId,
        seatsBooked: seats,
      }).unwrap();

      const bookingId = bookingRes.data.id;

      // 2. Process simulated payment
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
  };

  // Helper to build voucher URL
  const getAbsoluteVoucherUrl = (relativeUrl: string) => {
    if (!relativeUrl) return "#";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const domainBase = apiBase.replace("/api/v1", "");
    return `${domainBase}${relativeUrl}`;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-12 min-h-[80vh]">
      
      {/* Title */}
      <div className="mb-10 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Checkout Secure Gateway</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Lock in your booking seats deposit.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Side: Steps / Payment Simulator Forms (Col 3) */}
        <div className="md:col-span-3 space-y-6">
          
          {checkoutStep === "summary" && (
            <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
              <h3 className="text-base font-bold text-text-primary tracking-wide border-b border-border-custom pb-2">
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
                Transactions are secured under the orbitX Travel checkout encryption guidelines.
              </p>
            </div>
          )}

          {checkoutStep === "pay_simulate" && (
            <form onSubmit={handleProcessCheckout} className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none animate-in fade-in duration-200">
              
              {/* Payment Branding Banner */}
              <div className={`p-4 text-center font-bold text-white text-lg rounded-none ${ paymentMethod === "bkash" ? "bg-[#e2136e]" : "bg-[#f15a22]" }`}>
                {paymentMethod.toUpperCase()} SANDBOX GATEWAY
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
            <div className="border border-border-custom bg-bg-primary p-6 text-center space-y-6 rounded-none animate-in fade-in zoom-in-95 duration-300">
              
              <CheckCircle2 className="h-16 w-16 text-theme-secondary mx-auto" />
              <h2 className="text-2xl font-bold text-text-primary">Payment Complete!</h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                Your deposit lock fee of <span className="font-bold text-theme-secondary">BDT {completedBooking.paidAmount}</span> has been processed. The remaining balance will be settled prior to departure.
              </p>

              {/* Receipt Details Box */}
              <div className="p-4 bg-bg-secondary border border-border-custom text-xs text-text-secondary text-left space-y-2.5 rounded-none font-medium max-w-md mx-auto">
                <div className="flex justify-between">
                  <span>Booking Reference ID:</span>
                  <span className="font-bold text-text-primary font-mono">{completedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>MFS Payment Transaction ID:</span>
                  <span className="font-bold text-text-primary font-mono">{completedBooking.paymentTxnId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Status:</span>
                  <span className="font-bold text-theme-secondary">{completedBooking.bookingStatus}</span>
                </div>
              </div>

              {/* Voucher Action Download button */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={getAbsoluteVoucherUrl(completedBooking.voucherUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-theme-primary text-text-white px-6 py-3 font-bold text-xs rounded-none hover:bg-opacity-95 transition flex items-center justify-center space-x-2"
                >
                  <FileDown className="h-4.5 w-4.5" />
                  <span>Download Voucher PDF</span>
                </a>
                <Link
                  href="/"
                  className="bg-btn-secondary text-btn-text-secondary px-6 py-3 font-bold text-xs border border-border-custom rounded-none hover:bg-opacity-80 transition flex items-center justify-center"
                >
                  Go to Dashboard
                </Link>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Billing summary sidebar (Col 2) */}
        <div className="md:col-span-2">
          <div className="border border-border-custom bg-bg-secondary/40 p-6 space-y-5 rounded-none">
            <h4 className="text-xs font-bold text-text-primary border-b border-border-custom pb-2">
              Booking Summary
            </h4>
            
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary line-clamp-2">{pkg.title}</p>
              <p className="text-xs text-text-light">{pkg.destination}</p>
            </div>

            <div className="border-t border-border-custom pt-4 space-y-3.5 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Rate per Seat:</span>
                <span>BDT {pkg.totalPackagePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Seats:</span>
                <span className="font-bold text-text-primary">{seats}</span>
              </div>
              <div className="flex justify-between border-t border-border-custom pt-3 text-text-primary font-bold">
                <span>Total Cost:</span>
                <span>BDT {fullPriceDue}</span>
              </div>
            </div>

            {/* Split Price Summary banner */}
            <div className="border-t border-border-custom pt-4 space-y-3">
              <div className="p-3 bg-theme-secondary/10 border border-theme-secondary/20 rounded-none text-xs">
                <div className="flex justify-between font-bold text-theme-secondary">
                  <span>Payable Now (Deposit):</span>
                  <span>BDT {totalDepositDue}</span>
                </div>
              </div>
              <div className="p-3 bg-bg-primary border border-border-custom rounded-none text-[11px] text-text-light">
                <div className="flex justify-between font-bold text-text-secondary">
                  <span>Balance Due Later:</span>
                  <span>BDT {fullPriceDue - totalDepositDue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-1.5 text-[10px] text-text-light leading-normal pt-1">
              <Lock className="h-3.5 w-3.5 text-theme-primary shrink-0 mt-0.5" />
              <span>Payments are simulated under sandbox guidelines. No real money will be charged.</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
