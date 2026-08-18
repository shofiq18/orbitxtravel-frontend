"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetPackagesQuery } from "@/redux/api/tour/tourApi";
import { useGetHotelsQuery } from "@/redux/api/hotel/hotelApi";
import { useGetReviewsQuery } from "@/redux/api/review/reviewApi";
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Search, 
  X,
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  FileText,
  HeartHandshake,
  BadgePercent,
  Check,
  Building2,
  ArrowRight,
  ArrowUpRight,
  Quote
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
  const [hoveredAdvantageCard, setHoveredAdvantageCard] = useState<number | null>(null);

  // Mobile search & date picker toggle states
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Fetch raw full database lists for dynamic location extraction
  const { data: allPackagesResponse } = useGetPackagesQuery(undefined);
  const { data: allHotelsResponse } = useGetHotelsQuery(undefined);

  const rawPackages = allPackagesResponse?.data || [];
  const rawHotels = allHotelsResponse?.data || [];

  // Dynamically extract unique location names & counts from real DB records
  const dynamicDestinations = useMemo(() => {
    const map = new Map<string, { name: string; type: string; count: number }>();

    rawPackages.forEach((pkg: any) => {
      if (pkg.destination) {
        const dest = pkg.destination.trim();
        const existing = map.get(dest.toLowerCase());
        if (existing) {
          existing.count += 1;
        } else {
          map.set(dest.toLowerCase(), {
            name: dest,
            type: "Tour Package",
            count: 1,
          });
        }
      }
    });

    rawHotels.forEach((hotel: any) => {
      const loc = hotel.address || hotel.city || hotel.name;
      if (loc) {
        // Extract main location name (e.g. "Cox's Bazar" from "Cox's Bazar, Bangladesh")
        const mainLoc = loc.split(",")[0].trim();
        const existing = map.get(mainLoc.toLowerCase());
        if (existing) {
          existing.count += 1;
        } else {
          map.set(mainLoc.toLowerCase(), {
            name: mainLoc,
            type: "Hotel & Stay",
            count: 1,
          });
        }
      }
    });

    // Default fallback popular destinations if DB is empty
    if (map.size === 0) {
      const fallbacks = [
        { name: "Cox's Bazar", type: "Beach & Coast", count: 12 },
        { name: "Sajek Valley", type: "Hill & Nature", count: 8 },
        { name: "Sylhet", type: "Tea Gardens", count: 10 },
        { name: "Saint Martin", type: "Coral Island", count: 6 },
        { name: "Sreemangal", type: "Eco Resort", count: 7 },
        { name: "Bandarban", type: "Mountains", count: 9 },
        { name: "Dhaka", type: "City Stays", count: 15 },
        { name: "Thailand", type: "International", count: 4 },
      ];
      fallbacks.forEach((f) => map.set(f.name.toLowerCase(), f));
    }

    return Array.from(map.values());
  }, [rawPackages, rawHotels]);

  // Filter dynamic suggestions in real-time as user types
  const filteredSuggestions = dynamicDestinations.filter((item) =>
    item.name.toLowerCase().includes(destination.toLowerCase()) ||
    item.type.toLowerCase().includes(destination.toLowerCase())
  );

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

  const fallbackReviews = [
    {
      id: "1",
      name: "Sajid Hasan",
      comment: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "SAJEK VALLEY RETREAT", address: "Dhaka, Bangladesh" }
    },
    {
      id: "2",
      name: "Tanjia Rahman",
      comment: "Explore a world of possibilities as you book verified host stays with total peace of mind. The instant PDF confirm voucher with host emergency contacts gave us total confidence for our Cox's Bazar check-in.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "OCEAN PARADISE RESORT", address: "Cox's Bazar, Bangladesh" }
    },
    {
      id: "3",
      name: "Rafiqul Islam",
      comment: "Escrow protection is a game changer! Funds were released to the host only after our Sreemangal tour departed on time. Super smooth user experience from start to finish on OrbitX Travel.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "GRAND SULTAN RESORT", address: "Sylhet, Bangladesh" }
    },
    {
      id: "4",
      name: "Scarlett Thomas",
      comment: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "SINGAPORE CITY HOTEL", address: "Singapore" }
    },
    {
      id: "5",
      name: "Nusrat Jahan",
      comment: "Super smooth user experience. The SMS departure reminders 24 hours prior saved our trip from any confusion! Verified vendors and instant confirmed stays on OrbitX Travel.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "BANDARBAN HILL RESORT", address: "Bandarban, Bangladesh" }
    },
    {
      id: "6",
      name: "Emily Watson",
      comment: "Booking direct tour packages with zero middleman markups was the best travel decision we made this year. Highly recommended platform for all travelers.....",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80",
      hotel: { name: "PARADISE COVE HOTEL", address: "Chittagong, Bangladesh" }
    }
  ];

  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(3);
  const reviewsToDisplay = reviewsList.length > 0 ? reviewsList : fallbackReviews;

  // Auto carousel effect replacing active review card every 3 seconds
  useEffect(() => {
    if (!reviewsToDisplay || reviewsToDisplay.length === 0) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviewsToDisplay.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviewsToDisplay.length]);

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

    setIsMobileSearchOpen(false);
  };

  return (
    <div className="w-full space-y-16 pb-16 bg-white text-[#111111]">
      
      {/* ========================================================================= */}
      {/* HERO SECTION MATCHING REFERENCE DESIGN */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[720px] sm:min-h-[820px] bg-slate-950 flex items-center overflow-visible py-12 sm:py-16">
        {/* Full-bleed Landscape Background Image */}
        <img
          src="/hero-image.png"
          alt="OrbitX Travel Landscape"
          className="absolute inset-0 w-full h-full z-0 opacity-95 object-cover"
        />
        {/* Crisp Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-0"></div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-8 lg:px-16 pt-16">
          <div className="max-w-3xl space-y-6">
            
            {/* Cursive Subtitle */}
            <p className="font-serif italic text-xl sm:text-4xl text-white/95 tracking-wide font-medium">
              Explorer and Travel
            </p>

            {/* Bold Main Headline */}
            <h1 className="text-4xl sm:text-7xl font-extrabold text-white tracking-tight uppercase leading-[1.08] drop-shadow-md">
              Let&apos;s Go Now
            </h1>

            {/* Sub-paragraph */}
            <p className="text-xs sm:text-sm text-slate-100 max-w-xl leading-relaxed font-semibold drop-shadow-sm">
              Book verified seat locks and luxury hotel stays curated by global tour organizers on OrbitX Travel.
            </p>

            {/* Search Bar Container with Glass Effect */}
            <div className="pt-1">
              
              {/* Ultra-Posh Mobile Glass Search Pill (Hidden when search form is open) */}
              {!isMobileSearchOpen && (
                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="w-full bg-white/15 backdrop-blur-2xl border border-white/25 p-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 cursor-pointer active:scale-98 transition-all"
                  >
                    <div className="text-left overflow-hidden pl-3">
                      <span className="block text-xs font-bold text-white tracking-wide truncate">
                        {destination ? destination : "Where to next?"}
                      </span>
                      <span className="block text-[11px] text-white/75 truncate">
                        {startDate || endDate ? `${startDate || "Any"} - ${endDate || "Any"}` : "Anywhere · Any week · Search stays & tours"}
                      </span>
                    </div>

                    {/* Search Icon on Right (No Chevron Arrow) */}
                    <div className="w-10 h-10 rounded-full bg-[#0061AA] flex items-center justify-center text-white shadow-md shrink-0">
                      <Search className="h-5 w-5" />
                    </div>
                  </button>
                </div>
              )}

              {/* Main Expanded Search Form (Always visible on Desktop, Shown on Mobile when open) */}
              <form
                onSubmit={handleSearch}
                className={`${isMobileSearchOpen ? "block" : "hidden sm:block"} bg-black/40 sm:bg-black/10 backdrop-blur-3xl p-4 sm:p-5 rounded-2xl sm:rounded-2xl shadow-2xl space-y-4 max-w-3xl border border-white/15 sm:border-none relative mt-0 animate-in fade-in duration-200 z-30 overflow-visible`}
              >
                {/* Search Tabs & Mobile Close Button */}
                <div className="flex items-center justify-between space-x-2">
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

                  {/* Mobile Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="sm:hidden p-2 rounded-full bg-white/10 text-white/80 hover:text-white cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Capsule Fields Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 overflow-visible">
                  
                  {/* Location Field Card with Glass Effect & Suggestions Dropdown */}
                  <div className="relative group flex-grow w-full md:w-auto z-40">
                    <div 
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="flex items-center space-x-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 sm:border-none transition-all cursor-pointer"
                    >
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
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setIsLocationPickerOpen(true);
                          }}
                          onFocus={() => setIsLocationPickerOpen(true)}
                          className="w-full bg-transparent text-xs sm:text-sm text-white font-extrabold outline-none placeholder-white/70 mt-0.5"
                        />
                      </div>
                    </div>

                    {/* Location Suggestions Dropdown Modal */}
                    {isLocationPickerOpen && (
                      <div className="absolute left-0 right-0 top-full pt-1.5 z-50 min-w-[280px] sm:min-w-[320px]">
                        <div className="bg-slate-900/98 backdrop-blur-2xl p-3 shadow-2xl rounded-2xl text-white border border-white/15 space-y-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto">
                          <div className="flex justify-between items-center px-2 pt-1 pb-2 border-b border-white/10">
                            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Available Destinations</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsLocationPickerOpen(false);
                              }}
                              className="text-[10px] text-white/60 hover:text-white uppercase font-bold cursor-pointer"
                            >
                              Close
                            </button>
                          </div>

                          {filteredSuggestions.length > 0 ? (
                            <div className="space-y-1 pt-1">
                              {filteredSuggestions.map((loc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDestination(loc.name);
                                    setIsLocationPickerOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-colors text-left group cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-[#0061AA] group-hover:text-white transition-colors shrink-0">
                                      <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{loc.name}</span>
                                      <span className="block text-[10px] text-slate-400">{loc.type}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-300 font-semibold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                    {typeof loc.count === "number" ? `${loc.count} Listing(s)` : loc.count}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                              No destinations matching &quot;{destination}&quot;
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Travel & Stay Dates Field Card with Glass Effect */}
                  <div className="relative group flex-grow w-full md:w-auto">
                    <div 
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="flex items-center space-x-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-xl cursor-pointer transition-all text-left h-full border border-white/10 sm:border-none"
                    >
                      {searchTab === "tours" ? (
                        <Clock className="h-5 w-5 text-white shrink-0" />
                      ) : (
                        <Calendar className="h-5 w-5 text-white shrink-0" />
                      )}
                      <div className="flex-grow">
                        <span className="block text-[11px] font-extrabold text-white/90 uppercase tracking-wider">
                          {searchTab === "hotels" ? "Stay Dates" : "Travel Dates"}
                        </span>
                        <span className="block text-xs sm:text-sm text-white font-extrabold mt-0.5 truncate">
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

                    {/* Date Picker Dropdown Modal */}
                    <div className={`absolute left-0 right-0 top-full pt-1.5 z-50 ${isDatePickerOpen ? "block" : "hidden group-hover:block hover:block"} min-w-[300px] sm:min-w-[320px]`}>
                      <div className="bg-slate-900/98 backdrop-blur-2xl p-4 shadow-2xl rounded-2xl text-white border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[11px] font-extrabold text-white/90 uppercase tracking-wider">
                            {searchTab === "hotels" ? "Select Stay Duration" : "Select Travel Duration"}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDatePickerOpen(false);
                            }}
                            className="text-[10px] font-bold text-amber-400 hover:underline uppercase"
                          >
                            Done
                          </button>
                        </div>
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
                    className="w-full md:w-auto bg-btn-primary text-btn-text-primary hover:bg-opacity-90 font-black text-xs py-3.5 px-6 rounded-xl flex items-center justify-center cursor-pointer shadow-xl transition-all shrink-0 uppercase tracking-wider h-full border-none"
                    title="Search"
                  >
                    <Search className="h-6 w-6 text-btn-text-primary mr-2 md:mr-0" />
                    <span className="md:hidden text-xs font-black">SEARCH ORBITX</span>
                  </button>

                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="w-full mx-auto px-0 sm:px-8 lg:px-16">
        <div className="space-y-1.5 mb-8 border-b border-neutral-200 pb-4 px-4 sm:px-0">
          <h3 className="text-3xl sm:text-5xl font-serif font-medium text-black tracking-normal leading-tight">
            Tour Packages
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal">
            Direct bookings on verified seat locks.
          </p>
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

                  <div className="max-h-[220px] opacity-100 sm:max-h-0 sm:opacity-0 overflow-hidden sm:group-hover:max-h-[220px] sm:group-hover:opacity-100 transition-all duration-500 ease-in-out space-y-3">
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
      <section className="w-full mx-auto px-0 sm:px-8 lg:px-16 mt-16">
        <div className="space-y-1.5 mb-8 border-b border-neutral-200 pb-4 px-4 sm:px-0">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl sm:text-5xl font-serif font-medium text-black tracking-normal leading-tight">
              Featured Hotels
            </h3>
            <Link href="/hotels" className="text-xs font-bold text-black hover:underline flex items-center gap-1 uppercase tracking-wider">
              <span>View All Properties</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal">
            Direct bookings on verified premium hotels & stays.
          </p>
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

                    <div className="max-w-[180px] opacity-100 sm:max-w-0 sm:opacity-0 overflow-hidden sm:group-hover:max-w-[180px] sm:group-hover:opacity-100 transition-all duration-300 ease-in-out text-right shrink-0">
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
      {/* THE ORBITX ADVANTAGE - EXACT FLUTTERWAVE OVERLAPPING CARDS */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#141414] py-24 sm:py-32 px-4 sm:px-8 lg:px-16 mt-20 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              Endless travel possibilities for every <span className="font-serif italic font-normal text-[#0061AA]">explorer</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
              OrbitX offers a host of seamless products for individuals, ensuring smooth transactions and efficient money management.
            </p>
          </div>

          {/* Flutterwave Exact Overlapping Stacked Cards (4 Cards) */}
          <div className="flex flex-col lg:flex-row items-center justify-center pt-4 pb-12 overflow-visible max-w-6xl mx-auto">
            {[
              {
                title: "Direct host tour bookings",
                desc: "Experience 100% transparent direct pricing with zero middleman markups. Lock tour package seats directly with verified hosts and organizers right",
                link: "here",
                href: "/tours"
              },
              {
                title: "Verified stay & hotel escrow",
                desc: "Explore verified hotel stays with total peace of mind. Every host undergoes strict NID & trade license verification while funds stay protected in escrow right",
                link: "here",
                href: "/hotels"
              },
              {
                title: "Instant PDF confirm vouchers",
                desc: "Receive automated instant PDF confirm vouchers complete with reference UUIDs, QR verification, and host emergency contacts right",
                link: "here",
                href: "/checkout"
              },
              {
                title: "24/7 Departure & stay alerts",
                desc: "Stay informed before your trip with automated pre-trip email & SMS reminders dispatched 24 hours prior to departure and check-in dates right",
                link: "here",
                href: "/contact"
              }
            ].map((card, idx) => {
              // Stack order: Card 0 (z-10), Card 1 (z-20), Card 2 (z-30), Card 3 (z-40)
              const zIndex = (idx + 1) * 10;
              const marginClass = idx === 0 ? "ml-0" : "-mt-10 lg:-mt-0 lg:-ml-32";

              // Calculate horizontal slide displacement:
              // Any card after the currently hovered card slides right by 180px
              let translateX = "translate-x-0";
              if (hoveredAdvantageCard !== null && idx > hoveredAdvantageCard) {
                translateX = "lg:translate-x-[110px]";
              }

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredAdvantageCard(idx)}
                  onMouseLeave={() => setHoveredAdvantageCard(null)}
                  style={{ zIndex }}
                  className={`
                    relative w-full lg:w-[430px] shrink-0 min-h-[200px] sm:min-h-[230px]
                    rounded-[28px] p-6 sm:p-8 cursor-pointer
                    transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    flex flex-col justify-start space-y-4 border border-white/5
                    shadow-[0_20px_50px_rgba(0,0,0,0.65)] bg-[#313131] hover:bg-[#2c2c2c]
                    ${marginClass} ${translateX}
                  `}
                >
                  <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-normal">
                    {card.desc}{" "}
                    <Link 
                      href={card.href} 
                      className="underline font-medium text-white hover:text-[#0061AA] transition-colors inline-block ml-0.5"
                    >
                      {card.link}
                    </Link>
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D SCALE-UP SECTION 2: BECOME A HOST (100% EDGE-TO-EDGE ZERO-GAP 2-CARD GRID) */}
      {/* ========================================================================= */}
      <section className="w-full my-20 px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
          
          {/* Image Card 1: Tour Organizers */}
          <div className="relative w-full h-[550px] sm:h-[680px] overflow-hidden group cursor-pointer">
            <img
              src="/tour-become.avif"
              alt="Become Tour Host"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/25 to-transparent z-10"></div>

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
              src="/hotel-1.jpg"
              alt="Become Hotel Owner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/25 to-transparent z-10"></div>

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
      {/* SECTION 3: TRUST & IMPACT STATS (EXACT FULL-BLEED DESIGN MATCHING REFERENCE) */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#051C2C] py-20 sm:py-28 px-4 sm:px-12 lg:px-20 my-16 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Top Row: Headline & Trust Badges */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <h2 className="text-3xl sm:text-5xl font-serif font-medium text-white tracking-tight leading-[1.15] max-w-xl">
              Trusted by thousands to keep their <span className="font-serif italic font-normal text-[#38bdf8]">journey moving</span>
            </h2>

            {/* Badges Row - Single Inline Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl flex items-center space-x-2 shadow-lg shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <div className="text-left whitespace-nowrap">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 leading-none">VERIFIED</p>
                  <p className="text-xs font-semibold text-white leading-tight">Escrow Stays</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl flex items-center space-x-2 shadow-lg shrink-0">
                <Award className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                <div className="text-left whitespace-nowrap">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-amber-400 leading-none">RATED #1</p>
                  <p className="text-xs font-semibold text-white leading-tight">Tour Portal</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl flex items-center space-x-2 shadow-lg shrink-0">
                <Star className="w-4.5 h-4.5 text-sky-400 fill-sky-400 shrink-0" />
                <div className="text-left whitespace-nowrap">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-sky-400 leading-none">CUSTOMER CHOICE</p>
                  <p className="text-xs font-semibold text-white leading-tight">4.9 / 5.0 Rating</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl flex items-center space-x-2 shadow-lg shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <div className="text-left whitespace-nowrap">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-blue-400 leading-none">GUARANTEE</p>
                  <p className="text-xs font-semibold text-white leading-tight">Instant PDF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: 4 Large Clean Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pt-12 border-t border-white/10">
            <div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                10,000<span className="text-[#38bdf8]">+</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide mt-2">
                happy travelers
              </p>
            </div>

            <div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                500<span className="text-[#38bdf8]">+</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide mt-2">
                verified stays & tours
              </p>
            </div>

            <div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                99.8<span className="text-[#38bdf8]">%</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide mt-2">
                on-time guarantee
              </p>
            </div>

            <div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                4.9<span className="text-2xl font-normal text-neutral-400"> / 5.0</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide mt-2">
                satisfaction rating
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SPLIT CARD TESTIMONIAL (EXACT MATCHING USER REFERENCE DESIGN) */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-24 text-black overflow-hidden px-0 sm:px-8">
        <div className="max-w-6xl mx-auto px-0 sm:px-8 space-y-10">
          
          {/* Section Header with Title & Description */}
          <div className="text-center space-y-3 max-w-2xl mx-auto px-4 sm:px-0">
            <p className="font-serif italic text-2xl sm:text-3xl text-[#0061AA] font-medium tracking-wide flex items-center justify-center gap-2">
              <span>Review &amp; Testimonials</span>
            </p>
            <h2 className="text-3xl sm:text-5xl font-normal text-black tracking-wide uppercase font-sans">
              TOP REVIEWS FOR ORBITX
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed font-normal">
              Authentic experiences and direct host feedback shared by verified travelers on OrbitX.
            </p>
          </div>

          {reviewsToDisplay.length > 0 && (() => {
            const activeReview = reviewsToDisplay[activeReviewIndex % reviewsToDisplay.length];
            const currentIdx = activeReviewIndex % reviewsToDisplay.length;

            return (
              <div className="space-y-6 w-full px-0">
                {/* Fixed Height Split Card */}
                <div className="bg-[#181620] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-500 md:h-[380px] lg:h-[400px] w-full">
                  
                  {/* Left Side: Large Portrait Image (Grayscale B&W tone - Full Height) */}
                  <div className="w-full md:w-5/12 relative h-[260px] sm:h-[300px] md:h-full bg-neutral-900 overflow-hidden shrink-0">
                    <img
                      src={activeReview.avatar?.startsWith("http") ? activeReview.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"}
                      alt={activeReview.name}
                      className="w-full h-full object-cover grayscale contrast-110 brightness-95 transition-all duration-700 ease-in-out"
                    />
                  </div>

                  {/* Right Side: Dark Content Panel */}
                  <div className="w-full md:w-7/12 p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-6 text-left bg-[#181620] h-full overflow-hidden">
                    
                    <div className="space-y-4">
                      {/* Review Icon inside dark card */}
                      <img 
                        src="/review-icon.png" 
                        alt="Review Icon" 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain brightness-0 invert opacity-90" 
                      />

                      {/* Testimonial Quote Comment Text with fixed line-clamp (....) */}
                      <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed font-normal tracking-wide line-clamp-4 sm:line-clamp-5">
                        {activeReview.comment}
                      </p>
                    </div>

                    {/* Author Name and Role / Location */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide">
                        {activeReview.name}, <span className="text-neutral-500">{activeReview.hotel?.name || activeReview.hotel?.address || "Verified Explorer"}</span>
                      </p>
                    </div>

                  </div>

                </div>

                {/* Carousel Indicator Dots Outside Below Card (Matching user reference SS) */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {reviewsToDisplay.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveReviewIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIdx === idx ? "w-8 bg-[#0061AA]" : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

    </div>
  );
}