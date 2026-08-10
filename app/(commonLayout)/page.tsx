"use client";

import { useState } from "react";
import { useGetPackagesQuery } from "@/redux/api/tour/tourApi";
import { useGetHotelsQuery } from "@/redux/api/hotel/hotelApi";
import { Compass, MapPin, Calendar, Search, ShieldCheck, Bus, Hotel, UtensilsCrossed, AlertTriangle, Loader2, Clock } from "lucide-react";
import Link from "next/link";

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
    <div className="w-full space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative w-full h-[580px] bg-bg-dark flex items-center justify-center overflow-hidden transition-colors duration-300">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/10 z-0"></div>

        {/* Text Container */}
        <div className="relative z-10 w-full mx-auto px-8 lg:px-16 text-center text-white space-y-4 pb-20">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-wide">
            Discover Your Next Escapade
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto">
            Book verified seat locks and luxury hotel stays curated by global tour organizers on OrbitX Travel.
          </p>
        </div>
      </section>

      {/* Floating Search Section overlaying bottom of Hero Section */}
      <div className="relative z-30 max-w-4xl mx-auto px-8 lg:px-0 -mt-28 space-y-0">
        {/* Search Tabs */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setSearchTab("tours")}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer border-t border-x ${
              searchTab === "tours"
                ? "bg-btn-primary text-btn-text-primary border-btn-primary"
                : "bg-bg-secondary text-text-secondary border-border-custom hover:bg-bg-secondary/80"
            }`}
            style={{ marginBottom: "-1px", zIndex: 10 }}
          >
            Tour Packages
          </button>
          <button
            type="button"
            onClick={() => setSearchTab("hotels")}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer border-t border-x ${
              searchTab === "hotels"
                ? "bg-btn-primary text-btn-text-primary border-btn-primary"
                : "bg-bg-secondary text-text-secondary border-border-custom hover:bg-bg-secondary/80"
            }`}
            style={{ marginBottom: "-1px", zIndex: 10, marginLeft: "4px" }}
          >
            Hotels & Stays
          </button>
        </div>

        {/* Search Inputs Container */}
        <form
          onSubmit={handleSearch}
          className="bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary rounded-none shadow-2xl relative z-0"
        >
          {searchTab === "tours" ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Destination Search */}
              <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
                <MapPin className="h-5 w-5 text-text-light shrink-0" />
                <div className="flex-grow">
                  <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Destination</span>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary outline-none mt-0.5"
                  />
                </div>
              </div>

              {/* Travel Dates Range Picker Dropdown */}
              <div className="relative md:col-span-2 group">
                <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none cursor-pointer hover:bg-bg-secondary/80 transition-all text-left h-full">
                  <Clock className="h-5 w-5 text-text-light shrink-0" />
                  <div className="flex-grow">
                    <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Travel Dates</span>
                    <span className="block text-xs text-text-primary font-semibold mt-0.5">
                      {startDate && endDate 
                        ? `${startDate} to ${endDate}`
                        : startDate 
                        ? `From ${startDate}`
                        : endDate 
                        ? `To ${endDate}`
                        : "Select travel duration"}
                    </span>
                  </div>
                </div>

                {/* Dropdown containing both pickers together */}
                <div className="absolute left-0 right-0 top-full pt-2 z-50 hidden group-hover:block hover:block">
                  <div className="bg-bg-primary border border-border-custom p-4 shadow-2xl rounded-none">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Select Duration</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg-secondary border border-border-custom p-2 rounded-none">
                        <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider">From</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          onClick={(e: any) => e.target.showPicker?.()}
                          className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5 cursor-pointer text-left"
                        />
                      </div>
                      <div className="bg-bg-secondary border border-border-custom p-2 rounded-none">
                        <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider">To</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          onClick={(e: any) => e.target.showPicker?.()}
                          className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5 cursor-pointer text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-stretch">
                <button
                  type="submit"
                  className="w-full bg-btn-primary text-btn-text-primary hover:bg-opacity-95 font-bold flex items-center justify-center space-x-2 cursor-pointer transition rounded-none text-xs h-full py-3"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Tours</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Destination Input (Bed/Hotel Icon) */}
              <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
                <Hotel className="h-5 w-5 text-text-light shrink-0" />
                <div className="flex-grow">
                  <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Enter destination</span>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary outline-none mt-0.5"
                  />
                </div>
              </div>

              {/* Stay Dates Range Picker Dropdown */}
              <div className="relative md:col-span-2 group">
                <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none cursor-pointer hover:bg-bg-secondary/80 transition-all text-left h-full">
                  <Calendar className="h-5 w-5 text-text-light shrink-0" />
                  <div className="flex-grow">
                    <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Stay Dates</span>
                    <span className="block text-xs text-text-primary font-semibold mt-0.5">
                      {startDate && endDate 
                        ? `${startDate} to ${endDate}`
                        : startDate 
                        ? `From ${startDate}`
                        : endDate 
                        ? `To ${endDate}`
                        : "Select stay duration"}
                    </span>
                  </div>
                </div>

                {/* Dropdown containing both pickers together */}
                <div className="absolute left-0 right-0 top-full pt-2 z-50 hidden group-hover:block hover:block">
                  <div className="bg-bg-primary border border-border-custom p-4 shadow-2xl rounded-none">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Select Stay Duration</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg-secondary border border-border-custom p-2 rounded-none">
                        <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider">Check-In</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          onClick={(e: any) => e.target.showPicker?.()}
                          className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5 cursor-pointer text-left"
                        />
                      </div>
                      <div className="bg-bg-secondary border border-border-custom p-2 rounded-none">
                        <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider">Check-Out</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          onClick={(e: any) => e.target.showPicker?.()}
                          className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5 cursor-pointer text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-stretch">
                <button
                  type="submit"
                  className="w-full bg-btn-primary text-btn-text-primary hover:bg-opacity-95 font-bold flex items-center justify-center space-x-2 cursor-pointer transition rounded-none text-xs h-full py-3"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Hotels</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Main Listings Grid */}
      <section className="w-full mx-auto px-8 lg:px-16">
        <div className="flex items-center justify-between mb-8 border-b border-border-custom pb-4">
          <div>
            <h3 className="text-2xl font-semibold text-text-primary tracking-wide">Active Tour Packages</h3>
            <p className="text-sm text-text-light mt-1">Direct bookings on verified seat locks.</p>
          </div>
          <div className="text-sm font-semibold text-text-secondary bg-bg-secondary border border-border-custom px-4 py-2 rounded-none">
            {packagesList.length} Packages Found
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[480px] border border-border-custom animate-pulse bg-bg-primary w-full"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3 rounded-none max-w-xl mx-auto my-12">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading packages</p>
              <p className="text-xs">Failed to connect to the backend server. Please verify your connection status.</p>
            </div>
          </div>
        )}

        {!isLoading && !error && packagesList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary max-w-md mx-auto rounded-none">
            <Compass className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-text-primary">No Packages Available</h4>
            <p className="text-sm text-text-secondary mt-1">Try clearing your filters to see more results.</p>
          </div>
        )}

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {packagesList.map((pkg: any) => {
            return (
              <Link
                key={pkg.id}
                href={`/tours/${pkg.id}`}
                className="relative w-full h-[480px] bg-bg-dark overflow-hidden block border border-border-custom group cursor-pointer"
              >
                <img
                  src={(pkg.inclusions as any)?.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80"}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-500 "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10 transition-opacity duration-300 group-hover:from-black/95"></div>

                {pkg.organizer?.isVerified && (
                  <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Host</span>
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 pb-2 z-20 space-y-2">
                  <h4 className="text-base font-semibold text-white leading-tight line-clamp-2 flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-theme-accent shrink-0 mt-0.5" />
                    <span>{pkg.title}</span>
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-300 font-semibold">
                    <span>Departs: {new Date(pkg.startDate).toLocaleDateString()}</span>
                    <span className="text-theme-accent">{pkg.availableSeats} Seats Left</span>
                  </div>
                  <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 ease-in-out border-t border-gray-700/80 pt-3 mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Full price</p>
                      <p className="text-sm font-extrabold text-theme-accent">BDT {pkg.totalPackagePrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Duration</p>
                      <p className="text-xs font-bold text-white text-right mt-0.5">
                        {(() => {
                          const start = new Date(pkg.startDate);
                          const end = new Date(pkg.endDate);
                          const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                          const nights = days - 1;
                          return nights > 0 
                            ? `${days} Days - ${nights} Night${nights > 1 ? 's' : ''}`
                            : `${days} Day${days > 1 ? 's' : ''}`;
                        })()}
                      </p>
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
        <div className="flex items-center justify-between mb-8 border-b border-border-custom pb-4">
          <div>
            <h3 className="text-2xl font-semibold text-text-primary tracking-wide">Featured Hotels</h3>
            <p className="text-sm text-text-light mt-1">Direct bookings on verified premium hotels & stays.</p>
          </div>
          <Link href="/hotels" className="text-sm font-bold text-theme-primary hover:underline">
            View All Hotels &rarr;
          </Link>
        </div>

        {/* Loading / Error States for Hotels */}
        {isLoadingHotels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[480px] border border-border-custom animate-pulse bg-bg-primary w-full"></div>
            ))}
          </div>
        )}

        {hotelsError && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3 rounded-none max-w-xl mx-auto my-12">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading hotels</p>
              <p className="text-xs">Failed to connect to the backend server. Please verify your connection status.</p>
            </div>
          </div>
        )}

        {!isLoadingHotels && !hotelsError && hotelsList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary max-w-md mx-auto rounded-none">
            <Hotel className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-text-primary">No Hotels Available</h4>
            <p className="text-sm text-text-secondary mt-1">Check back later for newly added properties.</p>
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
                className="relative w-full h-[480px] bg-bg-dark overflow-hidden block border border-border-custom group cursor-pointer"
              >
                <img
                  src={hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10 transition-opacity duration-300 group-hover:from-black/95"></div>

                {hotel.isVerified && (
                  <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Stay</span>
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 pb-2 z-20 space-y-2">
                  <h4 className="text-base font-semibold text-white leading-tight line-clamp-2">
                    {hotel.name}
                  </h4>
                  <p className="text-[11px] text-gray-300 flex items-center space-x-1 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-theme-accent shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </p>
                  <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 ease-in-out border-t border-gray-700/80 pt-3 mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Standard Rate</p>
                      <p className="text-sm font-extrabold text-theme-accent">
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
    </div>
  );
}