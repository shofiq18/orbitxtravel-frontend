"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Bus, Hotel, Utensils, ShieldCheck, Compass, Info, Loader2, ArrowLeft, Check, Ticket } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function TourDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: packageResponse, isLoading, error } = useGetPackageByIdQuery(id);
  const pkg = packageResponse?.data;

  const { user } = useSelector((state: RootState) => state.user);
  const [seatsBooked, setSeatsBooked] = useState(1);

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please log in to initiate booking.");
      router.push(`/login?redirect=/tours/${id}`);
      return;
    }
    
    // Redirect to checkout with package ID and seats query parameter
    router.push(`/checkout/${id}?seats=${seatsBooked}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Retrieving tour details...</span>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 space-y-4">
        <ShieldCheck className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-text-primary">Tour Not Found</h3>
        <p className="text-sm text-text-secondary">
          The requested package details could not be found or have been removed.
        </p>
        <Link href="/" className="bg-btn-primary text-btn-text-primary px-6 py-2 text-xs font-bold rounded-none">
          Back to Search
        </Link>
      </div>
    );
  }

  // Calculate pricing splits
  const totalDueNow = seatsBooked * pkg.minimumSeatLockFee;
  const totalFullPrice = seatsBooked * pkg.totalPackagePrice;
  const totalDueLater = totalFullPrice - totalDueNow;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 space-y-8">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Search</span>
      </Link>

      {/* Cover Image banner */}
      {((pkg.inclusions as any)?.coverImage) && (
        <div className="w-full h-80 md:h-[450px] bg-bg-secondary border border-border-custom overflow-hidden relative rounded-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(pkg.inclusions as any).coverImage}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Columns: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Title Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-theme-primary text-text-white text-xs font-bold px-3 py-1 rounded-none">
                {pkg.destination}
              </span>
              {pkg.organizer?.isVerified && (
                <span className="bg-theme-secondary text-white text-xs font-bold px-3 py-1 flex items-center space-x-1 rounded-none">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Host</span>
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              {pkg.title}
            </h1>

            {/* Travel dates */}
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary border-t border-b border-border-custom py-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-text-primary">Departure:</span>
                <span>{new Date(pkg.startDate).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-text-primary">Return:</span>
                <span>{new Date(pkg.endDate).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
              </div>
            </div>
          </div>

          {/* Package Inclusions Checklist Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary tracking-wide">Included in this Tour</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Transport */}
              {pkg.inclusions?.transport && (
                <div className="border border-border-custom p-4 space-y-2 rounded-none bg-bg-primary">
                  <Bus className="h-6 w-6 text-theme-primary" />
                  <p className="text-xs font-bold text-text-primary">Transit Method</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{pkg.inclusions.transport}</p>
                </div>
              )}

              {/* stay */}
              {pkg.inclusions?.stayType && (
                <div className="border border-border-custom p-4 space-y-2 rounded-none bg-bg-primary">
                  <Hotel className="h-6 w-6 text-theme-primary" />
                  <p className="text-xs font-bold text-text-primary">Accommodations</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{pkg.inclusions.stayType}</p>
                </div>
              )}

              {/* meals */}
              {pkg.inclusions?.mealPlan && (
                <div className="border border-border-custom p-4 space-y-2 rounded-none bg-bg-primary">
                  <Utensils className="h-6 w-6 text-theme-primary" />
                  <p className="text-xs font-bold text-text-primary">Meal Plan</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{pkg.inclusions.mealPlan}</p>
                </div>
              )}

            </div>
          </div>

          {/* Custom itinerary checklist activities */}
          {pkg.inclusions?.customs && pkg.inclusions.customs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary tracking-wide">Highlights & Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pkg.inclusions.customs.map((activity: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-bg-secondary border border-border-custom rounded-none">
                    <Check className="h-4.5 w-4.5 text-theme-secondary shrink-0 mt-0.5" />
                    <span className="text-xs text-text-secondary font-medium leading-normal">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Gallery */}
          {((pkg.inclusions as any)?.photos) && ((pkg.inclusions as any).photos.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary tracking-wide">Tour Gallery</h3>
              <div className="flex flex-wrap gap-4">
                {(pkg.inclusions as any).photos.map((photoUrl: string, idx: number) => (
                  <div key={idx} className="relative w-36 h-28 border border-border-custom bg-bg-secondary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Tour Gallery ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Host Profile section */}
          <div className="p-6 border border-border-custom bg-bg-secondary/40 space-y-4 rounded-none">
            <h4 className="text-sm font-bold text-text-primary">Registered Tour Host Organizer</h4>
            <div className="flex items-start space-x-4">
              <div className="bg-theme-primary text-text-white h-12 w-12 flex items-center justify-center text-xl font-bold rounded-none shrink-0">
                {pkg.organizer?.fullName?.substring(0, 2) || "AG"}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text-primary flex items-center space-x-1">
                  <span>{pkg.organizer?.fullName}</span>
                  {pkg.organizer?.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-theme-secondary inline" />
                  )}
                </p>
                <p className="text-xs text-text-light">{pkg.organizer?.email}</p>
                {pkg.organizer?.businessProfile?.address && (
                  <p className="text-xs text-text-secondary leading-relaxed">{pkg.organizer.businessProfile.address}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Booking Selector Box */}
        <div className="space-y-6">
          <div className="border border-border-custom bg-bg-primary p-6 space-y-6 sticky top-24 rounded-none">
            
            {/* Price section */}
            <div>
              <p className="text-[10px] text-text-light font-bold">Per Seat Lock Deposit Fee</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-theme-secondary">BDT {pkg.minimumSeatLockFee}</span>
                <span className="text-xs text-text-light font-semibold">Deposit Lock Fee</span>
              </div>
              <p className="text-xs text-text-light mt-1">Full Seat Cost: BDT {pkg.totalPackagePrice}</p>
            </div>

            {/* Availability details */}
            <div className="flex items-center justify-between text-xs font-bold border-y border-border-custom py-3.5 text-text-secondary">
              <span>Seats Available:</span>
              <span className="text-theme-primary bg-bg-secondary px-3 py-1 rounded-none border border-border-custom">
                {pkg.availableSeats} of {pkg.maxSeats} Left
              </span>
            </div>

            {pkg.availableSeats > 0 ? (
              <div className="space-y-4">
                
                {/* Seats Booked Selector */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Select Seats Number</label>
                  <select
                    value={seatsBooked}
                    onChange={(e) => setSeatsBooked(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none font-bold"
                  >
                    {Array.from({ length: Math.min(10, pkg.availableSeats) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "Seat" : "Seats"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Summary Box */}
                <div className="p-4 bg-bg-secondary border border-border-custom space-y-3.5 rounded-none text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Selected Seats:</span>
                    <span className="font-bold text-text-primary">{seatsBooked}</span>
                  </div>
                  <div className="flex justify-between text-theme-secondary font-bold">
                    <span>Due Now (Seat Lock Fee):</span>
                    <span>BDT {totalDueNow}</span>
                  </div>
                  <div className="flex justify-between text-text-light font-medium border-t border-border-custom pt-2">
                    <span>Due Later (At Departure):</span>
                    <span>BDT {totalDueLater}</span>
                  </div>
                  <div className="flex justify-between font-bold text-text-primary border-t border-border-custom pt-2">
                    <span>Total Package Cost:</span>
                    <span>BDT {totalFullPrice}</span>
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full bg-btn-primary text-btn-text-primary font-bold py-3.5 px-4 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer"
                >
                  <Ticket className="h-4.5 w-4.5" />
                  <span>Lock Seats Deposit</span>
                </button>
              </div>
            ) : (
              <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs text-center font-bold rounded-none">
                Fully Booked! No seats remaining.
              </div>
            )}

            {/* Note info */}
            <div className="flex items-start space-x-2 text-[10px] text-text-light leading-normal bg-bg-secondary/50 p-3 border border-border-custom/50">
              <Info className="h-3.5 w-3.5 text-theme-primary shrink-0 mt-0.5" />
              <span>
                Paying the Seat Lock Deposit holds your seats. The remaining BDT balance is settled directly with the host organizer 24 hours prior to departure.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
