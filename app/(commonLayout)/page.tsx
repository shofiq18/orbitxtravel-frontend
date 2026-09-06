"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Quote,
  User,
  Bed,
  Minus,
  Plus
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

  // Guest counter state variables
  const [adults, setAdults] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  // Click outside refs for dropdown modals
  const guestPickerRef = useRef<HTMLDivElement>(null);
  const locationPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setIsGuestPickerOpen(false);
      }
      if (locationPickerRef.current && !locationPickerRef.current.contains(event.target as Node)) {
        setIsLocationPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getGuestSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} ${adults === 1 ? "Adult" : "Adults"}`);
    if (childrenCount > 0) parts.push(`${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}`);
    if (infants > 0) parts.push(`${infants} ${infants === 1 ? "Infant" : "Infants"}`);
    if (pets > 0) parts.push(`${pets} ${pets === 1 ? "Pet" : "Pets"}`);
    return parts.length > 0 ? parts.join(", ") : "Add guests";
  };

  // Mobile search & date picker toggle states
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Fetch raw full database lists for dynamic location extraction
  const { data: allPackagesResponse } = useGetPackagesQuery(undefined);
  const { data: allHotelsResponse } = useGetHotelsQuery(undefined);

  const rawPackages = allPackagesResponse?.data || [];
  const rawHotels = allHotelsResponse?.data || [];

  // Full clean list of 64 districts of Bangladesh
  const BD_DISTRICTS = useMemo(() => [
    "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur",
    "Chapainawabganj", "Chattogram", "Chuadanga", "Cumilla", "Cox's Bazar", "Dhaka", "Dinajpur",
    "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore",
    "Jhalokathi", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram",
    "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur",
    "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
    "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
    "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur",
    "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
  ], []);

  // Filter 64 district suggestions in real-time as user types
  const filteredSuggestions = useMemo(() => {
    if (!destination) return BD_DISTRICTS;
    return BD_DISTRICTS.filter((dist) =>
      dist.toLowerCase().includes(destination.toLowerCase())
    );
  }, [destination, BD_DISTRICTS]);

  // Filters to send to API
  const [filters, setFilters] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
    verifiedOnly?: boolean;
  }>({});

  const [hotelFilters, setHotelFilters] = useState<{
    address?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
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
    const totalGuests = adults + childrenCount + infants + pets;
    
    if (searchTab === "tours") {
      // Set filters ONLY for Tour Packages
      const activePkgFilters: typeof filters = {};
      if (destination) activePkgFilters.destination = destination;
      if (startDate) activePkgFilters.startDate = startDate;
      if (endDate) activePkgFilters.endDate = endDate;
      if (totalGuests > 0) activePkgFilters.guests = totalGuests;
      if (verifiedOnly) activePkgFilters.verifiedOnly = true;
      setFilters(activePkgFilters);
      setHotelFilters({}); // Reset hotel filters

      setIsMobileSearchOpen(false);

      // Scroll to tour packages section
      setTimeout(() => {
        const el = document.getElementById("tour-packages-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Set filters ONLY for Stays/Hotels
      const activeHotelFilters: typeof hotelFilters = {};
      if (destination) activeHotelFilters.address = destination;
      if (startDate) activeHotelFilters.startDate = startDate;
      if (endDate) activeHotelFilters.endDate = endDate;
      if (totalGuests > 0) activeHotelFilters.guests = totalGuests;
      if (verifiedOnly) activeHotelFilters.verifiedOnly = "true";
      setHotelFilters(activeHotelFilters);
      setFilters({}); // Reset tour package filters

      setIsMobileSearchOpen(false);

      // Scroll to featured hotels section
      setTimeout(() => {
        const el = document.getElementById("featured-hotels-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div className="w-full space-y-16 pb-16 bg-white text-[#111111]">
      
      {/* ========================================================================= */}
      {/* HERO SECTION MATCHING REFERENCE DESIGN */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] bg-slate-950 flex items-center justify-center overflow-visible py-16 sm:py-24">
        {/* Full-bleed Landscape Background Image */}
        <img
          src="/hero-image.png"
          alt="OrbitX Travel Landscape"
          className="absolute inset-0 w-full h-full z-0 opacity-90 object-cover"
        />
        {/* Crisp Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/60 z-0"></div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-8 flex flex-col items-center justify-center text-center">
          
          {/* Centered Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide uppercase leading-tight max-w-4xl drop-shadow-lg">
            WE OFFER AWARD WINNING TRAVELING SERVICES WITH REASONABLE PRICES
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-normal mt-4 leading-relaxed drop-shadow-md">
            Book verified seat locks and luxury hotel stays curated by global tour organizers on OrbitX Travel.
          </p>

          {/* Search Card Container with Overlapping Tabs */}
          <div className="w-full max-w-5xl mx-auto relative z-40 mt-12 sm:mt-16 text-left">
            
            {/* Search Tabs sticking up on the top left */}
            <div className="flex items-center space-x-1 pl-0 relative z-10 -mb-px">
              <button
                type="button"
                onClick={() => setSearchTab("tours")}
                className={`px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
                  searchTab === "tours"
                    ? "bg-[#DCDCDC] text-gray-900 border-[#C8C8C8] border-b-[#DCDCDC] font-extrabold relative z-10"
                    : "bg-[#1A1A1A] text-white/80 border-transparent hover:bg-black/80 hover:text-white"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Tour</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchTab("hotels")}
                className={`px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
                  searchTab === "hotels"
                    ? "bg-[#DCDCDC] text-gray-900 border-[#C8C8C8] border-b-[#DCDCDC] font-extrabold relative z-10"
                    : "bg-[#1A1A1A] text-white/80 border-transparent hover:bg-black/80 hover:text-white"
                }`}
              >
                <Bed className="h-4 w-4" />
                <span>Hotel</span>
              </button>
            </div>

            {/* Main Search Card Container */}
            <div className="bg-[#DCDCDC] rounded-b-2xl rounded-tr-2xl p-5 sm:p-6 shadow-2xl text-gray-900 border border-[#C8C8C8] relative z-0">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
                
                {/* Destination Input Field */}
                <div ref={locationPickerRef} className="md:col-span-4 space-y-0 relative">
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-2 pl-0.5">
                    Destination
                  </label>
                  <div 
                    onClick={() => {
                      setIsGuestPickerOpen(false);
                      setIsLocationPickerOpen((prev) => !prev);
                    }}
                    className="flex items-center space-x-2.5 bg-[#C8C8C8] hover:bg-[#BCBCBC] px-3.5 h-[48px] rounded-xl cursor-pointer transition-all border border-gray-400/40"
                  >
                    <MapPin className="h-4 w-4 text-gray-700 shrink-0" />
                    <input
                      type="text"
                      placeholder="Your Destination..........."
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setIsLocationPickerOpen(true);
                      }}
                      onFocus={() => setIsLocationPickerOpen(true)}
                      className="w-full bg-transparent text-xs sm:text-sm text-gray-900 font-semibold outline-none placeholder-gray-600"
                    />
                  </div>

                  {/* Location Suggestions Dropdown */}
                  {isLocationPickerOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full pt-2 z-50 min-w-[280px]"
                    >
                      <div className="bg-white rounded-2xl p-3 shadow-2xl border border-gray-200 text-gray-900 max-h-[280px] overflow-y-auto space-y-1">
                        <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100 mb-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">BD 64 Districts</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLocationPickerOpen(false);
                            }}
                            className="text-[10px] font-bold text-[#0061AA] hover:underline cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                        {filteredSuggestions.length > 0 ? (
                          filteredSuggestions.map((districtName, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDestination(districtName);
                                setIsLocationPickerOpen(false);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left cursor-pointer"
                            >
                              <MapPin className="h-4 w-4 text-[#0061AA] shrink-0" />
                              <span className="text-xs font-bold text-gray-900">{districtName}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-500 font-medium">
                            No district matching &quot;{destination}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date 1 Field: Check In / From */}
                <div className="md:col-span-2 space-y-0 relative">
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-2 pl-0.5">
                    {searchTab === "hotels" ? "Check In" : "From"}
                  </label>
                  <div className="relative flex items-center space-x-2.5 bg-[#C8C8C8] hover:bg-[#BCBCBC] px-3.5 h-[48px] rounded-xl cursor-pointer transition-all border border-gray-400/40">
                    <Calendar className="h-4 w-4 text-gray-700 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold uppercase truncate">
                      {startDate ? startDate : "YY-MM-DD"}
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Date 2 Field: Check Out / To */}
                <div className="md:col-span-2 space-y-0 relative">
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-2 pl-0.5">
                    {searchTab === "hotels" ? "Check Out" : "To"}
                  </label>
                  <div className="relative flex items-center space-x-2.5 bg-[#C8C8C8] hover:bg-[#BCBCBC] px-3.5 h-[48px] rounded-xl cursor-pointer transition-all border border-gray-400/40">
                    <Calendar className="h-4 w-4 text-gray-700 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold uppercase truncate">
                      {endDate ? endDate : "YY-MM-DD"}
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Who / Add Guests Selection Field */}
                <div ref={guestPickerRef} className="md:col-span-3 space-y-0 relative">
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-2 pl-0.5">
                    Who
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLocationPickerOpen(false);
                      setIsGuestPickerOpen((prev) => !prev);
                    }}
                    className="w-full flex items-center space-x-2.5 bg-[#C8C8C8] hover:bg-[#BCBCBC] px-3.5 h-[48px] rounded-xl cursor-pointer transition-all border border-gray-400/40 text-left"
                  >
                    <Users className="h-4 w-4 text-gray-700 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold truncate">
                      {getGuestSummary()}
                    </span>
                  </button>

                  {/* Guest Option Selection Dropdown (Image 2 design) */}
                  {isGuestPickerOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full pt-2 z-50 min-w-[320px] sm:min-w-[360px]"
                    >
                      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 text-gray-900 space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guest Selection</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsGuestPickerOpen(false);
                            }}
                            className="text-xs font-bold text-[#0061AA] hover:underline cursor-pointer"
                          >
                            Done
                          </button>
                        </div>

                        {/* Adults */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Adults</p>
                            <p className="text-xs text-gray-500">Ages 13 or above</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              disabled={adults <= 0}
                              onClick={(e) => {
                                e.preventDefault();
                                setAdults((prev) => Math.max(0, prev - 1));
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-gray-900">{adults}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setAdults((prev) => prev + 1);
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Children</p>
                            <p className="text-xs text-gray-500">Ages 2 – 12</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              disabled={childrenCount <= 0}
                              onClick={(e) => {
                                e.preventDefault();
                                setChildrenCount((prev) => Math.max(0, prev - 1));
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-gray-900">{childrenCount}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setChildrenCount((prev) => prev + 1);
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Infants</p>
                            <p className="text-xs text-gray-500">Under 2</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              disabled={infants <= 0}
                              onClick={(e) => {
                                e.preventDefault();
                                setInfants((prev) => Math.max(0, prev - 1));
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-gray-900">{infants}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setInfants((prev) => prev + 1);
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Pets */}
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">Pets</p>
                            <p className="text-xs text-gray-400 underline cursor-pointer hover:text-gray-600">Bringing a service animal?</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              disabled={pets <= 0}
                              onClick={(e) => {
                                e.preventDefault();
                                setPets((prev) => Math.max(0, prev - 1));
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-gray-900">{pets}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setPets((prev) => prev + 1);
                              }}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 active:scale-95 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button Icon Container */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    type="submit"
                    className="w-full bg-[#C8C8C8] hover:bg-[#BCBCBC] text-gray-900 h-[48px] rounded-xl border border-gray-400/40 flex items-center justify-center cursor-pointer transition-all shadow-sm group"
                    title="Search"
                  >
                    <Search className="h-5 w-5 text-gray-800 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Main Listings Grid */}
      <section id="tour-packages-section" className="w-full mx-auto px-0 sm:px-8 lg:px-16">
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
                  <div className="space-y-1">
                    {pkg.destination && (
                      <p className="text-xs text-gray-200 font-bold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-white shrink-0" />
                        <span>{pkg.destination}</span>
                      </p>
                    )}
                    <h4 className="text-base font-bold text-white leading-tight line-clamp-2">
                      {pkg.title}
                    </h4>
                  </div>

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
      <section id="featured-hotels-section" className="w-full mx-auto px-0 sm:px-8 lg:px-16 mt-16">
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