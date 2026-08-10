"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Bus, Hotel, Utensils, ShieldCheck, Compass, Info, Loader2, ArrowLeft, ArrowRight, Check, Ticket, Clock } from "lucide-react";
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
 
  // Lightbox Zoom Modal States
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
 
  // Itinerary Scroll Refs
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

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
        <h3 className="text-xl font-semibold text-text-primary">Tour Not Found</h3>
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
    <div className="w-full mx-auto px-8 lg:px-16 py-10 space-y-8">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Search</span>
      </Link>

      {/* Cover Image banner */}
      {((pkg.inclusions as any)?.coverImage) && (
        <div className="w-full h-80 md:h-[450px] bg-bg-secondary border border-border-custom overflow-hidden relative rounded-none cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(pkg.inclusions as any).coverImage}
            alt={pkg.title}
            onClick={() => setFullScreenImage((pkg.inclusions as any).coverImage)}
            className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
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
            
            <h1 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-wide leading-tight">
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
            <h3 className="text-xl font-semibold text-text-primary tracking-wide">Included in this Tour</h3>
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
              <h3 className="text-xl font-semibold text-text-primary tracking-wide">Highlights & Activities</h3>
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
 
          {/* Itinerary Snapping Timeline Slider (Red Clock style) */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-custom pb-2">
                <h3 className="text-xl font-semibold text-text-primary tracking-wide">Tour Itinerary</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => scroll("left")}
                    className="p-2 border border-border-custom bg-bg-primary text-text-primary hover:bg-bg-secondary transition rounded-none cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scroll("right")}
                    className="p-2 border border-border-custom bg-bg-primary text-text-primary hover:bg-bg-secondary transition rounded-none cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
 
              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory scrollbar-none pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                {pkg.itinerary.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-[320px] shrink-0 border border-border-custom bg-bg-primary relative flex flex-col snap-start overflow-hidden group"
                  >
                    {/* Day image layer */}
                    <div className="relative h-44 w-full bg-bg-secondary overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-10"></div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60"}
                        alt={`Day ${item.day}`}
                        onClick={() => setFullScreenImage(item.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60")}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      />
                      
                      {/* Day Green Badge */}
                      <span className="absolute top-3 left-3 z-20 bg-theme-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-none">
                        Day {item.day}
                      </span>
 
                      {/* Day Title Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </div>
 
                    {/* Day detail description */}
                    <div className="p-4 flex-grow space-y-2 max-h-40 overflow-y-auto text-xs text-text-secondary leading-relaxed bg-bg-primary">
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Gallery */}
          {((pkg.inclusions as any)?.photos) && ((pkg.inclusions as any).photos.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary tracking-wide">Tour Gallery</h3>
              <div className="flex flex-wrap gap-4">
                {(pkg.inclusions as any).photos.map((photoUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setFullScreenImage(photoUrl)}
                    className="relative w-36 h-28 border border-border-custom bg-bg-secondary overflow-hidden cursor-pointer hover:border-theme-primary transition-all group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Tour Gallery ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Host Profile section */}
          <div className="p-6 border border-border-custom bg-bg-secondary/40 space-y-4 rounded-none">
            <h4 className="text-sm font-semibold text-text-primary">Registered Tour Host Organizer</h4>
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
 
      {/* Lightbox Modal */}
      {fullScreenImage && (
        <div
          onClick={() => setFullScreenImage(null)}
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullScreenImage}
              alt="Full screen gallery view"
              className="max-h-full object-contain shadow-2xl"
            />
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/85 p-2 rounded-full border border-gray-700 font-extrabold text-sm w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
