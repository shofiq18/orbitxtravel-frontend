"use client";

import { useState, useEffect } from "react";
import { useGetPackagesQuery } from "@/redux/api/tour/tourApi";
import { useGetHotelsQuery } from "@/redux/api/hotel/hotelApi";
import { useGetReviewsQuery } from "@/redux/api/review/reviewApi";
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Bus, 
  Hotel, 
  UtensilsCrossed, 
  AlertTriangle, 
  Loader2, 
  Clock, 
  Star, 
  Users, 
  Award, 
  Send, 
  CheckCircle2, 
  Ticket, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap,
  FileText,
  HeartHandshake,
  BadgePercent,
  Check,
  Building2,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Marquee from "react-fast-marquee";

export default function Home() {
  // Search state variables
  const [searchTab, setSearchTab] = useState<"tours" | "hotels">("tours");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filters to send to API
  const [filters, setFilters] = useState<{
    destination?: string;
    startDate?: string;
    verifiedOnly?: boolean;
  }>({});

  const [hotelFilters, setHotelFilters] = useState<{
    address?: string;
    verifiedOnly?: string;
  }>({});

  const { data: packagesResponse, isLoading, error } = useGetPackagesQuery(filters);
  const packagesList = packagesResponse?.data || [];

  const { data: hotelsResponse, isLoading: isLoadingHotels, error: hotelsError } = useGetHotelsQuery(hotelFilters);
  const hotelsList = hotelsResponse?.data || [];

  const { data: reviewsResponse } = useGetReviewsQuery(undefined);
  const reviewsList = reviewsResponse?.data || [];

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success("You are subscribed to OrbitX Travel updates!");
    setNewsletterEmail("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set filters for Tour Packages
    const activePkgFilters: typeof filters = {};
    if (destination) activePkgFilters.destination = destination;
    if (startDate) activePkgFilters.startDate = startDate;
    if (verifiedOnly) activePkgFilters.verifiedOnly = true;
    setFilters(activePkgFilters);

    // Set filters for Stays/Hotels
    const activeHotelFilters: typeof hotelFilters = {};
    if (destination) activeHotelFilters.address = destination;
    if (verifiedOnly) activeHotelFilters.verifiedOnly = "true";
    setHotelFilters(activeHotelFilters);
  };

  return (
    <div className="w-full space-y-16 pb-16 bg-white text-[#111111]">
      
      {/* ========================================================================= */}
      {/* HERO SECTION MATCHING REFERENCE DESIGN */}
      {/* ========================================================================= */}
      <section className="relative w-full h-[720px] sm:h-[820px] bg-slate-950 flex items-center overflow-hidden">
        {/* Full-bleed Landscape Background Image */}
        <img
          src="/hero-image.png"
          alt="OrbitX Travel Landscape"
          className="absolute inset-0 w-full h-full z-0 opacity-95"
        />
        {/* Crisp Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-0"></div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full mx-auto px-8 lg:px-16 pt-16">
          <div className="max-w-3xl space-y-6">
            
            {/* Cursive Subtitle */}
            <p className="font-serif italic text-2xl sm:text-4xl text-white/95 tracking-wide font-medium">
              Explorer and Travel
            </p>

            {/* Bold Main Headline */}
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight uppercase leading-none drop-shadow-md">
              Let&apos;s Go Now
            </h1>

            {/* Sub-paragraph */}
            <p className="text-xs sm:text-sm text-slate-100 max-w-xl leading-relaxed font-semibold drop-shadow-sm">
              Book verified seat locks and luxury hotel stays curated by global tour organizers on OrbitX Travel.
            </p>

            {/* Search Bar Container with Default Glass Effect */}
            <div className="pt-2">
              <form
                onSubmit={handleSearch}
                className="bg-black/10 backdrop-blur-3xl p-4 sm:p-5 rounded-2xl shadow-2xl space-y-4 max-w-3xl border-none relative"
              >
                {/* Search Tabs */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSearchTab("tours")}
                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      searchTab === "tours"
                        ? "bg-btn-primary text-btn-text-primary shadow-lg"
                        : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                    }`}
                  >
                    Tour Packages
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab("hotels")}
                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      searchTab === "hotels"
                        ? "bg-btn-primary text-btn-text-primary shadow-lg"
                        : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                    }`}
                  >
                    Hotels & Stays
                  </button>
                </div>

                {/* Capsule Fields Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  {/* Location Field Card with Default Glass Effect */}
                  <div className="flex items-center space-x-3.5 w-full md:w-auto flex-grow bg-white/10 backdrop-blur-md p-3.5 rounded-xl border-none transition-all">
                    {searchTab === "tours" ? (
                      <MapPin className="h-5 w-5 text-white shrink-0" />
                    ) : (
                      <Hotel className="h-5 w-5 text-white shrink-0" />
                    )}
                    <div className="text-left w-full">
                      <span className="block text-[11px] font-extrabold text-white/90 uppercase tracking-wider">Location</span>
                      <input
                        type="text"
                        placeholder={searchTab === "tours" ? "Thailand, Cox's Bazar..." : "Where are you staying?"}
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm text-white font-extrabold outline-none placeholder-white/70 mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Travel & Stay Dates Field Card with Default Glass Effect */}
                  <div className="relative group flex-grow w-full md:w-auto">
                    <div className="flex items-center space-x-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-xl cursor-pointer transition-all text-left h-full border-none">
                      {searchTab === "tours" ? (
                        <Clock className="h-5 w-5 text-white shrink-0" />
                      ) : (
                        <Calendar className="h-5 w-5 text-white shrink-0" />
                      )}
                      <div className="flex-grow">
                        <span className="block text-[11px] font-extrabold text-white/90 uppercase tracking-wider">
                          {searchTab === "hotels" ? "Stay Dates" : "Travel Dates"}
                        </span>
                        <span className="block text-xs sm:text-sm text-white font-extrabold mt-0.5">
                          {startDate && endDate 
                            ? `${startDate} to ${endDate}`
                            : startDate 
                            ? (searchTab === "hotels" ? `Check-In: ${startDate}` : `From ${startDate}`)
                            : endDate 
                            ? (searchTab === "hotels" ? `Check-Out: ${endDate}` : `To ${endDate}`)
                            : (searchTab === "hotels" ? "Select stay duration" : "Select travel duration")}
                        </span>
                      </div>
                    </div>

                    {/* Continuous Hover Bridge Container (Zero Gap so Modal Never Hides on Cursor Move) */}
                    <div className="absolute left-0 right-0 top-full pt-1.5 z-50 hidden group-hover:block hover:block min-w-[320px]">
                      <div className="bg-slate-900/98 backdrop-blur-2xl p-4 shadow-2xl rounded-2xl text-white border border-white/10">
                        <p className="text-[11px] font-extrabold text-white/90 uppercase tracking-wider mb-3">
                          {searchTab === "hotels" ? "Select Stay Duration (Check-In - Check-Out)" : "Select Travel Duration (From - To)"}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 p-3 rounded-xl border-none">
                            <span className="block text-[10px] font-extrabold text-white/90 uppercase tracking-wider mb-1">
                              {searchTab === "hotels" ? "Check-In" : "From"}
                            </span>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              onClick={(e: any) => e.target.showPicker?.()}
                              style={{ colorScheme: "dark" }}
                              className="w-full bg-transparent text-xs text-white font-extrabold outline-none cursor-pointer text-left"
                            />
                          </div>
                          <div className="bg-white/10 p-3 rounded-xl border-none">
                            <span className="block text-[10px] font-extrabold text-white/90 uppercase tracking-wider mb-1">
                              {searchTab === "hotels" ? "Check-Out" : "To"}
                            </span>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              onClick={(e: any) => e.target.showPicker?.()}
                              style={{ colorScheme: "dark" }}
                              className="w-full bg-transparent text-xs text-white font-extrabold outline-none cursor-pointer text-left"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Primary Search Button */}
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-btn-primary text-btn-text-primary hover:bg-opacity-90 font-black text-xs py-4 px-4 rounded-xl flex items-center justify-center cursor-pointer shadow-xl transition-all shrink-0 uppercase tracking-wider h-full border-none"
                    title="Search"
                  >
                    <Search className="h-8 w-8 text-btn-text-primary" />
                 
                  </button>

                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="w-full mx-auto px-8 lg:px-16">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-black uppercase tracking-tight">Active Tour Packages</h3>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Direct bookings on verified seat locks.</p>
          </div>
          <div className="text-xs font-extrabold text-black bg-[#f5f5f5] border border-neutral-200 px-4 py-2 rounded-full">
            {packagesList.length} Packages Found
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[480px] border border-neutral-200 animate-pulse bg-[#f5f5f5] w-full rounded-2xl"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3 rounded-2xl max-w-xl mx-auto my-12">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading packages</p>
              <p className="text-xs">Failed to connect to the backend server. Please verify your connection status.</p>
            </div>
          </div>
        )}

        {!isLoading && !error && packagesList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-neutral-300 bg-[#f5f5f5] max-w-md mx-auto rounded-2xl">
            <Compass className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-black uppercase tracking-wide">No Packages Available</h4>
            <p className="text-xs text-neutral-500 mt-1">Try clearing your filters to see more results.</p>
          </div>
        )}

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {packagesList.map((pkg: any) => {
            return (
              <Link
                key={pkg.id}
                href={`/tours/${pkg.id}`}
                className="relative w-full h-[480px] bg-black overflow-hidden block border border-neutral-200 rounded-2xl group cursor-pointer shadow-md transition-all duration-300 ease-out"
              >
                <img
                  src={(pkg.inclusions as any)?.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80"}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/90"></div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 space-y-3">
                  <h4 className="text-base font-bold text-white leading-tight line-clamp-2 flex items-start gap-1">
                    <MapPin className="h-4.5 w-4.5 text-white shrink-0 mt-0.5" />
                    <span>{pkg.title}</span>
                  </h4>

                  <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[220px] group-hover:opacity-100 transition-all duration-500 ease-in-out space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-300 font-semibold">
                      <span>Departs: {new Date(pkg.startDate).toLocaleDateString()}</span>
                      <span className="text-white font-extrabold">{pkg.availableSeats} Seats Left</span>
                    </div>

                    <div className="border-t border-gray-700/80 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Full price</p>
                        <p className="text-base font-extrabold text-white mt-0.5">BDT {pkg.totalPackagePrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Duration</p>
                        <p className="text-xs font-bold text-white text-right mt-0.5">
                          {(() => {
                            const days = pkg.inclusions?.durationDays;
                            const nights = pkg.inclusions?.durationNights;
                            if (days !== undefined && nights !== undefined) {
                              return nights > 0 
                                ? `${days} ${days === 1 ? 'Day' : 'Days'} / ${nights} ${nights === 1 ? 'Night' : 'Nights'}`
                                : `${days} ${days === 1 ? 'Day' : 'Days'}`;
                            }
                            const start = new Date(pkg.startDate);
                            const end = new Date(pkg.endDate);
                            const calcDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                            const calcNights = calcDays - 1;
                            return calcNights > 0 
                              ? `${calcDays} ${calcDays === 1 ? 'Day' : 'Days'} / ${calcNights} ${calcNights === 1 ? 'Night' : 'Nights'}`
                              : `${calcDays} ${calcDays === 1 ? 'Day' : 'Days'}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="w-full mx-auto px-8 lg:px-16 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-black uppercase tracking-tight">Featured Hotels</h3>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Direct bookings on verified premium hotels & stays.</p>
          </div>
          <Link href="/hotels" className="text-xs font-extrabold text-black hover:underline flex items-center gap-1 uppercase tracking-wider">
            <span>View All Properties</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading / Error States for Hotels */}
        {isLoadingHotels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[480px] border border-neutral-200 animate-pulse bg-[#f5f5f5] w-full rounded-2xl"></div>
            ))}
          </div>
        )}

        {hotelsError && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3 rounded-2xl max-w-xl mx-auto my-12">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading hotels</p>
              <p className="text-xs">Failed to connect to the backend server. Please verify your connection status.</p>
            </div>
          </div>
        )}

        {!isLoadingHotels && !hotelsError && hotelsList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-neutral-300 bg-[#f5f5f5] max-w-md mx-auto rounded-2xl">
            <Hotel className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-black uppercase tracking-wide">No Hotels Available</h4>
            <p className="text-xs text-neutral-500 mt-1">Check back later for newly added properties.</p>
          </div>
        )}

        {/* Hotels Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hotelsList.slice(0, 4).map((hotel: any) => {
            const rooms = hotel.rooms || [];
            const startingPrice = rooms.length > 0
              ? Math.min(...rooms.map((r: any) => r.b2cPrice))
              : null;

            return (
              <Link
                key={hotel.id}
                href={`/hotels/${hotel.id}`}
                className="relative w-full h-[480px] bg-black overflow-hidden block border border-neutral-200 rounded-2xl group cursor-pointer shadow-md transition-all duration-300 ease-out"
              >
                <img
                  src={hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/90"></div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1 flex-grow min-w-0">
                      <h4 className="text-base font-bold text-white leading-tight line-clamp-2">
                        {hotel.name}
                      </h4>
                      <p className="text-[11px] text-gray-300 flex items-center space-x-1 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-white shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                      </p>
                    </div>

                    <div className="max-w-0 group-hover:max-w-[160px] opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 ease-in-out text-right shrink-0">
                      <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider whitespace-nowrap">Standard Rate</p>
                      <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 whitespace-nowrap">
                        {startingPrice ? `BDT ${startingPrice} / Night` : "Contact for rates"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 1: THE ORBITX ADVANTAGE */}
      {/* ========================================================================= */}
      <section className="w-full mx-auto px-4 sm:px-8 lg:px-16 mt-24">
        <div className="bg-[#f5f5f5] rounded-3xl p-8 sm:p-14 border border-neutral-200/80 space-y-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 block">
              THE ORBITX ADVANTAGE
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-black uppercase tracking-tight">
              WHY TRAVELERS & HOSTS CHOOSE ORBITX
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto font-medium">
              We eliminate middleman markups, connect you directly with verified tour hosts, and hold funds in escrow until departure.
            </p>
          </div>

          {/* 4 3D Scale Up Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 hover:scale-[1.04] hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-btn-primary text-btn-text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Ticket className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-black uppercase tracking-wide">Zero Hidden Fees</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Pay minimum seat lock deposits or direct hotel stay rates with 100% price transparency and zero surprise booking charges.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center text-xs font-bold text-black border-b border-black pb-0.5 group-hover:opacity-70 transition">
                  <span>Direct Pricing</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 hover:scale-[1.04] hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-btn-primary text-btn-text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-black uppercase tracking-wide">Verified Vendors</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Every hotel owner and tour organizer undergoes strict manual verification including trade license and NID authentication.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center text-xs font-bold text-black border-b border-black pb-0.5 group-hover:opacity-70 transition">
                  <span>100% Vetted Hosts</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 hover:scale-[1.04] hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-btn-primary text-btn-text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-black uppercase tracking-wide">Instant PDF Vouchers</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Automated instant PDF voucher generation with reference UUIDs, QR verification, and host emergency contact guide.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center text-xs font-bold text-black border-b border-black pb-0.5 group-hover:opacity-70 transition">
                  <span>Instant Confirmation</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 hover:scale-[1.04] hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-btn-primary text-btn-text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-black uppercase tracking-wide">24/7 Departure Alerts</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Automated pre-trip email & SMS reminders dispatched 24 hours prior to package departure and stay check-in dates.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center text-xs font-bold text-black border-b border-black pb-0.5 group-hover:opacity-70 transition">
                  <span>Automated Dispatch</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 2: BECOME A HOST (100% EDGE-TO-EDGE ZERO-GAP 2-CARD GRID) */}
      {/* ========================================================================= */}
      <section className="w-full my-20 px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
          
          {/* Image Card 1: Tour Organizers */}
          <div className="relative w-full h-[550px] sm:h-[680px] bg-black overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80"
              alt="Become Tour Host"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 z-20 space-y-4 text-left">
              <span className="text-xs font-bold tracking-wider text-white/90 block">
                OrbitX Tour Hosts
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-xl">
                List Your Tour Packages & Earn Direct Bookings
              </h3>
              <div className="pt-2">
                <Link
                  href="/become-host"
                  className="inline-flex items-center px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs rounded-full transition shadow-lg tracking-wide"
                >
                  <span>Become Tour Host</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Image Card 2: Hotel Owners */}
          <div className="relative w-full h-[550px] sm:h-[680px] bg-black overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80"
              alt="Become Hotel Owner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 z-20 space-y-4 text-left">
              <span className="text-xs font-bold tracking-wider text-white/90 block">
                OrbitX Hotel Owners
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-xl">
                List Your Hotel Rooms & Welcome Global Guests
              </h3>
              <div className="pt-2">
                <Link
                  href="/become-host"
                  className="inline-flex items-center px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs rounded-full transition shadow-lg tracking-wide"
                >
                  <span>Become Hotel Owner</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 3: TRUST & IMPACT STATS COUNTER */}
      {/* ========================================================================= */}
      <section className="w-full mx-auto px-4 sm:px-8 lg:px-16 my-16">
        <div className="bg-[#f5f5f5] border border-neutral-200/80 p-8 sm:p-12 rounded-3xl hover:shadow-xl transition-all duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1 group">
              <p className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight group-hover:scale-110 transition-transform">10,000+</p>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Happy Travelers</p>
            </div>

            <div className="space-y-1 group">
              <p className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight group-hover:scale-110 transition-transform">500+</p>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Verified Stays & Tours</p>
            </div>

            <div className="space-y-1 group">
              <p className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight group-hover:scale-110 transition-transform">99.8%</p>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">On-Time Guarantee</p>
            </div>

            <div className="space-y-1 group">
              <p className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight group-hover:scale-110 transition-transform">4.9 / 5.0</p>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Satisfaction Rating</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 4: TRAVELER REVIEWS / MARQUEE */}
      {/* ========================================================================= */}
      <section className="w-full py-16 my-16 overflow-hidden border-y border-neutral-200 bg-white">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2 px-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 block">
            REAL REVIEWS
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-black uppercase tracking-tight">
            WHAT TRAVELERS ARE SAYING
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Authentic experiences shared by verified travelers on OrbitX Travel.
          </p>
        </div>

        {/* 2-Row Dual Direction Marquee */}
        <div className="space-y-6 w-full">
          
          {/* Row 1: Left Scroll */}
          <Marquee speed={45} pauseOnHover={true} gradient={false} className="py-2">
            {reviewsList.map((rev: any, idx: number) => {
              const ratingValue = rev.rating || 5;
              return (
                <div key={`r1-${idx}`} className="px-3.5 py-2">
                  <div className="w-[360px] sm:w-[420px] h-[250px] bg-white border border-neutral-200 p-7 rounded-3xl text-left flex flex-col justify-between shrink-0 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer shadow-xs">
                    <div className="space-y-3">
                      
                      {/* Rating & Verified Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-4 w-4 ${s <= ratingValue ? "fill-black stroke-black" : "text-neutral-200"}`} />
                          ))}
                          <span className="text-xs font-black text-black ml-1.5">{ratingValue.toFixed(1)}</span>
                        </div>

                        <span className="bg-[#f5f5f5] text-black border border-neutral-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Check className="h-3 w-3 text-black" />
                          <span>Verified Booking</span>
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-neutral-600 leading-relaxed italic font-normal line-clamp-3">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Author Foot */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-neutral-100">
                      <img
                        src={rev.avatar?.startsWith("http") ? rev.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={rev.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-xs"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-black">{rev.name}</p>
                        <p className="text-[10px] font-extrabold text-neutral-500 tracking-wider uppercase mt-0.5">
                          {rev.hotel?.address ? rev.hotel.address.toUpperCase() : "VERIFIED TRAVELER"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Marquee>

          {/* Row 2: Right Scroll */}
          <Marquee speed={45} direction="right" pauseOnHover={true} gradient={false} className="py-2">
            {[...reviewsList].reverse().map((rev: any, idx: number) => {
              const ratingValue = rev.rating || 5;
              return (
                <div key={`r2-${idx}`} className="px-3.5 py-2">
                  <div className="w-[360px] sm:w-[420px] h-[250px] bg-white border border-neutral-200 p-7 rounded-3xl text-left flex flex-col justify-between shrink-0 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer shadow-xs">
                    <div className="space-y-3">
                      
                      {/* Rating & Verified Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-4 w-4 ${s <= ratingValue ? "fill-black stroke-black" : "text-neutral-200"}`} />
                          ))}
                          <span className="text-xs font-black text-black ml-1.5">{ratingValue.toFixed(1)}</span>
                        </div>

                        <span className="bg-[#f5f5f5] text-black border border-neutral-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Check className="h-3 w-3 text-black" />
                          <span>Verified Stay</span>
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-neutral-600 leading-relaxed italic font-normal line-clamp-3">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Author Foot */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-neutral-100">
                      <img
                        src={rev.avatar?.startsWith("http") ? rev.avatar : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                        alt={rev.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-xs"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-black">{rev.name}</p>
                        <p className="text-[10px] font-extrabold text-neutral-500 tracking-wider uppercase mt-0.5">
                          {rev.hotel?.name ? rev.hotel.name.toUpperCase() : "ORBITX MEMBER"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Marquee>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 5: VIP NEWSLETTER SUBSCRIPTION */}
      {/* ========================================================================= */}
      <section className="w-full mx-auto px-4 sm:px-8 lg:px-16 my-24">
        <div className="bg-black text-white p-10 sm:p-16 rounded-3xl text-center space-y-6 shadow-2xl max-w-4xl mx-auto relative overflow-hidden hover:scale-[1.01] transition-transform duration-300">
          
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 block">
              STAY IN THE LOOP
            </span>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase">
              NEVER MISS A TRAVEL DROP
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto font-medium leading-relaxed">
              Subscribe to get instant email alerts when new verified tour packages or hotel stay discounts drop on OrbitX Travel.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-3">
            <div className="bg-white p-2 rounded-full flex flex-col sm:flex-row items-center shadow-md">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full text-black placeholder-neutral-400 bg-transparent text-xs px-4 py-3 outline-none font-semibold"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-btn-primary text-btn-text-primary hover:bg-opacity-90 text-xs font-extrabold px-8 py-3.5 rounded-full transition shrink-0 cursor-pointer uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-md"
              >
                SUBSCRIBE
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 font-semibold">Zero Spam. Unsubscribe at any time.</p>
          </form>

        </div>
      </section>

    </div>
  );
}