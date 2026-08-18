"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPackageByIdQuery } from "@/redux/api/tour/tourApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  Bus, 
  Hotel, 
  Utensils, 
  ShieldCheck, 
  Compass, 
  Info, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Ticket, 
  Clock,
  Share,
  Heart,
  Globe
} from "lucide-react";
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
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | string | null>(null);
 
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

  // User actual photos arrays with empty placeholders fallback
  const defaultImages = [
    (pkg.inclusions as any)?.coverImage || "",
    (pkg.inclusions as any)?.photos?.[0] || "",
    (pkg.inclusions as any)?.photos?.[1] || "",
    (pkg.inclusions as any)?.photos?.[2] || "",
    (pkg.inclusions as any)?.photos?.[3] || "",
  ];

  const allPhotos = defaultImages.filter(Boolean);

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-10 space-y-8 details-page-wrapper">
      
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-custom pb-4 mb-2 mt-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-wide leading-tight">{pkg.title}</h1>
        
        {/* Right Action buttons */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary shrink-0">
          <button 
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 hover:bg-bg-secondary hover:text-text-primary py-1.5 px-3 bg-transparent transition rounded-none font-bold cursor-pointer text-xs"
          >
            <Share className="h-3.5 w-3.5 text-text-light" />
            <span>Share</span>
          </button>
          <button 
            onClick={() => toast.success("Tour package saved to favorites!")}
            className="flex items-center gap-1.5 hover:bg-bg-secondary hover:text-text-primary py-1.5 px-3 bg-transparent transition rounded-none font-bold cursor-pointer text-xs"
          >
            <Heart className="h-3.5 w-3.5 text-red-500" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Airbnb style 5-Photo Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-[400px] md:h-[550px] overflow-hidden rounded-none border border-border-custom relative bg-bg-secondary !mt-3">
        
        {/* Main Cover Image */}
        <div className="md:col-span-2 md:row-span-2 overflow-hidden cursor-zoom-in relative">
          {defaultImages[0] ? (
            <img
              src={defaultImages[0]}
              alt={`${pkg.title} - Cover`}
              onClick={() => setActivePhotoIdx(0)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-xs font-semibold">
              No Cover Photo Available
            </div>
          )}
        </div>

        {/* Top Middle Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[1] ? (
            <img
              src={defaultImages[1]}
              alt={`${pkg.title} - Highlight 1`}
              onClick={() => setActivePhotoIdx(1)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Top Right Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[2] ? (
            <img
              src={defaultImages[2]}
              alt={`${pkg.title} - Highlight 2`}
              onClick={() => setActivePhotoIdx(2)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Bottom Middle Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[3] ? (
            <img
              src={defaultImages[3]}
              alt={`${pkg.title} - Highlight 3`}
              onClick={() => setActivePhotoIdx(3)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Bottom Right Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block group">
          {defaultImages[4] ? (
            <img
              src={defaultImages[4]}
              alt={`${pkg.title} - Highlight 4`}
              onClick={() => setActivePhotoIdx(4)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
          {defaultImages[0] && (
            <button
              onClick={() => setActivePhotoIdx(0)}
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-black font-semibold text-xs py-2 px-3 shadow-md hover:scale-105 transition-all duration-300 rounded-none flex items-center gap-1.5 border border-gray-300 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Show all photos</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Columns: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Travel dates block */}
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary border-b border-border-custom pb-5">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-text-primary">Departure:</span>
              <span>{new Date(pkg.startDate).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-text-primary">Return:</span>
              <span>{new Date(pkg.endDate).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</span>
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
  
          {/* Itinerary Snapping Timeline Slider */}
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
                    className="w-[320px] h-[280px] shrink-0 border border-border-custom bg-bg-primary relative snap-start overflow-hidden group"
                  >
                    {/* Day image layer */}
                    <div className="relative w-full h-full bg-bg-secondary overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-10"></div>
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60"}
                        alt={`Day ${item.day}`}
                        onClick={() => setActivePhotoIdx(item.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60")}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      />
                      
                      {/* Day Green Badge */}
                      <span className="absolute top-3 left-3 z-20 bg-theme-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-none">
                        Day {item.day}
                      </span>
  
                      {/* Day Title Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-20 transition-opacity duration-300 group-hover:opacity-0">
                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </div>
  
                    {/* Day detail description (Hover Reveal Overlay) */}
                    <div className="absolute inset-0 bg-black/95 text-white p-5 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-30 overflow-y-auto scrollbar-none">
                      <span className="text-[10px] text-theme-secondary font-bold uppercase tracking-wider mb-1 block">Day {item.day}</span>
                      <h4 className="text-sm font-bold text-white mb-2 leading-tight">{item.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Host Profile section */}
          <div className="p-6 border border-border-custom bg-bg-secondary/40 space-y-4 rounded-none">
            <h4 className="text-sm font-semibold text-text-primary">Registered Tour Host Organizer</h4>
            <div className="flex items-start space-x-4">
              <div className="bg-theme-primary text-white h-12 w-12 flex items-center justify-center text-xl font-bold rounded-none shrink-0">
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
          <div className="border border-border-custom bg-bg-primary p-6 space-y-6 sticky top-24 shadow-xl rounded-none">
            
            {/* Price section */}
            <div>
              <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Per Seat Lock Deposit Fee</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-text-primary">BDT {pkg.minimumSeatLockFee}</span>
                <span className="text-xs text-text-secondary font-bold">Deposit Lock Fee</span>
              </div>
              <p className="text-xs text-text-primary font-bold mt-1">Full Seat Cost: <span className="font-extrabold text-black">BDT {pkg.totalPackagePrice}</span></p>
            </div>

            {/* Availability details */}
            <div className="flex items-center justify-between text-xs font-bold border-y border-border-custom py-3.5 text-text-primary">
              <span>Seats Available:</span>
              <span className="text-text-primary font-extrabold bg-bg-secondary px-3 py-1 rounded-none border border-border-custom">
                {pkg.availableSeats} of {pkg.maxSeats} Left
              </span>
            </div>

            {pkg.availableSeats > 0 ? (
              <div className="space-y-4">
                
                {/* Seats Booked Selector */}
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-2">Select Seats Number</label>
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
                <div className="p-4 bg-bg-secondary border border-border-custom space-y-3.5 rounded-none text-xs text-text-primary">
                  <div className="flex justify-between font-medium">
                    <span>Selected Seats:</span>
                    <span className="font-bold text-black">{seatsBooked}</span>
                  </div>
                  <div className="flex justify-between text-black font-bold">
                    <span>Due Now (Seat Lock Fee):</span>
                    <span className="text-emerald-700 font-extrabold text-sm">BDT {totalDueNow}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary font-medium border-t border-border-custom/60 pt-2.5">
                    <span>Due Later (At Departure):</span>
                    <span className="font-bold text-black">BDT {totalDueLater}</span>
                  </div>
                  <div className="flex justify-between font-bold text-black border-t border-border-custom/60 pt-2.5">
                    <span>Total Package Cost:</span>
                    <span className="font-extrabold text-sm">BDT {totalFullPrice}</span>
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full bg-btn-primary text-btn-text-primary font-bold py-3.5 px-4 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-none text-xs cursor-pointer shadow-md"
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
      {activePhotoIdx !== null && (
        <div
          onClick={() => setActivePhotoIdx(null)}
          className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Main Modal Wrapper (stops background click closure on content click) */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setActivePhotoIdx(null)}
              className="absolute top-4 right-4 z-50 text-white bg-black/60 hover:bg-black/85 p-2 rounded-full border border-gray-700 font-extrabold text-sm w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Photo Slide Area */}
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Left Navigation Arrow */}
              {typeof activePhotoIdx === 'number' && allPhotos.length > 1 && (
                <button
                  onClick={() => setActivePhotoIdx(prev => typeof prev === 'number' ? (prev === 0 ? allPhotos.length - 1 : prev - 1) : 0)}
                  className="absolute left-4 z-40 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-gray-800 transition cursor-pointer flex items-center justify-center"
                  aria-label="Previous Photo"
                >
                  <ArrowLeft className="h-6.5 w-6.5 text-white" />
                </button>
              )}

              {/* Image element */}
              <img
                src={typeof activePhotoIdx === 'number' ? allPhotos[activePhotoIdx] : activePhotoIdx}
                alt={typeof activePhotoIdx === 'number' ? `Full screen view - ${activePhotoIdx + 1}` : "Itinerary view"}
                className="max-h-[80vh] max-w-full object-contain shadow-2xl transition-all duration-300"
              />

              {/* Right Navigation Arrow */}
              {typeof activePhotoIdx === 'number' && allPhotos.length > 1 && (
                <button
                  onClick={() => setActivePhotoIdx(prev => typeof prev === 'number' ? (prev === allPhotos.length - 1 ? 0 : prev + 1) : 0)}
                  className="absolute right-4 z-40 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-gray-800 transition cursor-pointer flex items-center justify-center"
                  aria-label="Next Photo"
                >
                  <ArrowRight className="h-6.5 w-6.5 text-white" />
                </button>
              )}
            </div>

            {/* Photo Counter Label */}
            {typeof activePhotoIdx === 'number' && (
              <div className="absolute bottom-4 bg-black/75 px-4 py-1.5 text-xs text-white font-bold tracking-widest uppercase">
                Photo {activePhotoIdx + 1} of {allPhotos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
