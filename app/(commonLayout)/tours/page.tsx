"use client";

import { useState } from "react";
import { useGetPackagesQuery } from "@/redux/api/tour/tourApi";
import { Compass, MapPin, Calendar, Search, ShieldCheck, Bus, Hotel, UtensilsCrossed, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function FindToursPage() {
  // Search state variables
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

  const { data: packagesResponse, isLoading, error } = useGetPackagesQuery(filters);
  const packagesList = packagesResponse?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFilters: typeof filters = {};
    if (destination) activeFilters.destination = destination;
    if (startDate) activeFilters.startDate = startDate;
    if (verifiedOnly) activeFilters.verifiedOnly = true;
    setFilters(activeFilters);
  };

  return (
    <div className="w-full space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative w-full h-[420px] bg-bg-dark flex items-center justify-center overflow-hidden transition-colors duration-300">
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
        <div className="relative z-10 w-full mx-auto px-8 lg:px-16 text-center text-white space-y-4 pb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-wide">
            Find Tour Packages
          </h1>
          <p className=" text-base md:text-lg max-w-xl mx-auto">
            Search and book verified seat locks managed by professional organizers.
          </p>
        </div>
      </section>

      {/* Floating Search Section */}
      <div className="relative z-30 max-w-4xl mx-auto px-8 lg:px-0 -mt-26">
        <form
          onSubmit={handleSearch}
          className="bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary rounded-none shadow-2xl"
        >
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
              <Clock className="h-5 w-5 text-red-500 shrink-0" />
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
      </form>
      </div>

      {/* Main Listings view Grid */}
      <section className="w-full mx-auto px-8 lg:px-16 space-y-6">
        <div className="flex items-center justify-between border-b border-border-custom pb-4">
          <h3 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-wide">Active Tour Packages</h3>
          <div className="text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-custom px-3 py-1.5 rounded-none">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/85"></div>

                {pkg.organizer?.isVerified && (
                  <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Host</span>
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 space-y-3">
                  {/* Location Icon + Title - Always visible initially */}
                  <h4 className="text-base font-semibold text-white leading-tight line-clamp-2 flex items-start gap-1">
                    <MapPin className="h-4.5 w-4.5 text-white shrink-0 mt-0.5" />
                    <span>{pkg.title}</span>
                  </h4>

                  {/* Rest of information - Revealed on hover */}
                  <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[220px] group-hover:opacity-100 transition-all duration-500 ease-in-out space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-300 font-semibold">
                      <span>Departs: {new Date(pkg.startDate).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                      <span className="text-white">{pkg.availableSeats} Seats Left</span>
                    </div>

                    <div className="border-t border-gray-700/80 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Full price</p>
                        <p className="text-base font-bold text-white mt-0.5">BDT {pkg.totalPackagePrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-bold text-white text-right mt-0.5">
                          {(() => {
                            const days = pkg.inclusions?.durationDays;
                            const nights = pkg.inclusions?.durationNights;
                            if (days !== undefined && nights !== undefined) {
                              return nights > 0 
                                ? `${days} Days - ${nights} Night${nights > 1 ? 's' : ''}`
                                : `${days} Day${days > 1 ? 's' : ''}`;
                            }
                            const start = new Date(pkg.startDate);
                            const end = new Date(pkg.endDate);
                            const calcDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                            const calcNights = calcDays - 1;
                            return calcNights > 0 
                              ? `${calcDays} Days - ${calcNights} Night${calcNights > 1 ? 's' : ''}`
                              : `${calcDays} Day${calcDays > 1 ? 's' : ''}`;
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
    </div>
  );
}
