"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardOverview() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const role = user.currentRole || (user.roles && user.roles[0]) || "traveler";

    if (role === "admin") {
      router.replace("/dashboard/admin");
    } else if (role === "hotel_owner") {
      router.replace("/dashboard/hotel-owner");
    } else if (role === "tour_organizer") {
      router.replace("/dashboard/tour-organizer");
    } else {
      router.replace("/");
    }
  }, [user, router]);

  return (
    <div className="flex h-[60vh] w-full items-center justify-center text-text-secondary bg-bg-primary">
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-theme-primary mx-auto" />
        <p className="text-sm font-medium">Resolving your workspace dashboard...</p>
      </div>
    </div>
  );
}