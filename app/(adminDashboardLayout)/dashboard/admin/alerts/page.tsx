"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useTriggerPreTripAlertsMutation } from "@/redux/api/admin/adminApi";
import { BellRing, Loader2, Send, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminAlertsPage() {
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

  // Mutations
  const [triggerAlerts, { isLoading: isTriggering }] = useTriggerPreTripAlertsMutation();

  const handleTriggerAlertsScan = async () => {
    try {
      const response = await triggerAlerts(undefined).unwrap();
      toast.success(response?.message || "Pre-trip alerts scanner executed successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to trigger pre-trip alerts.");
    }
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Automation Trigger</h1>
        <p className="text-sm text-text-light mt-1">Manually dispatch pre-trip email alert notifications to travelers.</p>
      </div>

      <div className="max-w-xl mx-auto border border-border-custom bg-bg-primary p-8 space-y-6 rounded-none text-center">
        <BellRing className="h-12 w-12 text-theme-primary mx-auto" />
        <h3 className="text-xl font-semibold text-text-primary">Departure Email Alerts Dispatch Panel</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Scan OrbitX Travel bookings and dispatch automated pre-trip departure email reminders directly to travelers whose tours depart in exactly 24 hours.
        </p>

        <div className="p-4 bg-bg-secondary border border-border-custom text-xs text-text-secondary text-left space-y-2 rounded-none">
          <p className="font-bold flex items-center space-x-1.5 text-text-primary">
            <Info className="h-4 w-4 text-theme-primary shrink-0" />
            <span>Job Automation Logs:</span>
          </p>
          <p>1. Validates bookings with `bookingStatus = CONFIRMED` and `paymentStatus = PAID`.</p>
          <p>2. Checks package departure schedules against local timestamp ranges.</p>
          <p>3. Dispatches automated HTML email reminders via Nodemailer transport service.</p>
        </div>

        <button
          onClick={handleTriggerAlertsScan}
          disabled={isTriggering}
          className="w-full bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer"
        >
          {isTriggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
          <span>Execute Alerts Dispatch Job</span>
        </button>
      </div>
    </div>
  );
}
