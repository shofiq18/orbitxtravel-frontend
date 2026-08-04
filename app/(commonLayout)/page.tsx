"use client";

import { useState } from "react";
import { useGetPackagesQuery } from "@/redux/api/tour/tourApi";
import { Compass, MapPin, Calendar, Search, ShieldCheck, Bus, Hotel, UtensilsCrossed, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Search state variables
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
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
      <section className="relative w-full h-[450px] bg-bg-dark flex items-center justify-center overflow-hidden transition-colors duration-300">
        {/* Visual Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-teal-900 opacity-80 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700 via-transparent to-transparent opacity-40 z-0"></div>

        {/* Text Container */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-6 text-center text-white space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Discover Your Next Escapade
          </h2>
          <p className="text-text-light text-base md:text-lg max-w-xl mx-auto">
            Book verified seat locks and luxury hotel stays curated by global tour organizers on orbitX Travel.
          </p>

          {/* Search Inputs Container */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 rounded-none shadow-2xl"
          >
            {/* Destination Search */}
            <div className="text-left">
              <label className="block text-xs font-bold text-text-secondary mb-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-text-light" />
                <input
                  type="text"
                  placeholder="e.g. Cox's Bazar"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border-custom bg-bg-secondary text-sm outline-none focus:border-theme-primary rounded-none"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div className="text-left">
              <label className="block text-xs font-bold text-text-secondary mb-1">Departure Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-text-light" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border-custom bg-bg-secondary text-sm outline-none focus:border-theme-primary rounded-none"
                />
              </div>
            </div>

            {/* Verification Toggle */}
            <div className="flex items-center space-x-2 md:pt-5 pt-2 text-left justify-start md:justify-center">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 border-border-custom accent-theme-secondary rounded-none"
              />
              <label htmlFor="verifiedOnly" className="text-xs font-bold text-text-secondary flex items-center space-x-1 cursor-pointer select-none">
                <ShieldCheck className="h-4 w-4 text-theme-secondary inline" />
                <span>Verified Hosts Only</span>
              </label>
            </div>

            {/* Search CTA */}
            <div className="md:pt-4">
              <button
                type="submit"
                className="w-full bg-btn-primary text-btn-text-primary hover:bg-opacity-95 font-bold h-11 flex items-center justify-center space-x-2 cursor-pointer transition rounded-none text-xs"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8 border-b border-border-custom pb-4">
          <div>
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">Active Tour Packages</h3>
            <p className="text-sm text-text-light mt-1">Direct bookings on verified seat locks.</p>
          </div>
          <div className="text-sm font-semibold text-text-secondary bg-bg-secondary border border-border-custom px-4 py-2 rounded-none">
            {packagesList.length} Packages Found
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border-custom p-4 space-y-4 animate-pulse bg-bg-primary">
                <div className="h-48 bg-bg-secondary w-full"></div>
                <div className="h-4 bg-bg-secondary w-2/3"></div>
                <div className="h-4 bg-bg-secondary w-1/2"></div>
              </div>
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
            <h4 className="text-lg font-bold text-text-primary">No Packages Available</h4>
            <p className="text-sm text-text-secondary mt-1">Try clearing your filters to see more results.</p>
          </div>
        )}

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packagesList.map((pkg: any) => {
            const hasStay = !!pkg.inclusions?.stayType;
            const hasMeals = !!pkg.inclusions?.mealPlan;
            const hasTransport = !!pkg.inclusions?.transport;

            return (
              <div
                key={pkg.id}
                className="bg-bg-primary border border-border-custom flex flex-col justify-between transition-all duration-300 hover:shadow-lg rounded-none group"
              >
                {/* Package Head Image Layer */}
                <div className="relative h-48 w-full bg-bg-secondary overflow-hidden">
                  {/* cover overlay placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80"
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Destination Tag */}
                  <span className="absolute top-3 left-3 z-20 bg-bg-primary border border-border-custom text-text-primary px-3 py-1 text-xs font-bold rounded-none">
                    {pkg.destination}
                  </span>

                  {/* Verified badge */}
                  {pkg.organizer?.isVerified && (
                    <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Host</span>
                    </span>
                  )}

                  {/* Seat count banner */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-white font-bold">
                    <span className="bg-bg-dark/60 px-2 py-0.5 border border-gray-700/60 rounded-none">
                      Departs: {new Date(pkg.startDate).toLocaleDateString()}
                    </span>
                    <span className="bg-theme-accent text-bg-dark px-2 py-0.5 rounded-none">
                      {pkg.availableSeats} Seats Left
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow space-y-4">
                  <h4 className="text-lg font-bold text-text-primary group-hover:text-theme-primary transition-colors leading-tight line-clamp-2">
                    {pkg.title}
                  </h4>

                  {/* Inclusions checklist icons bar */}
                  <div className="flex items-center space-x-3 pt-1 border-y border-border-custom py-2.5 text-xs text-text-secondary">
                    {hasTransport && (
                      <span className="flex items-center space-x-1">
                        <Bus className="h-3.5 w-3.5 text-theme-primary" />
                        <span>Transit</span>
                      </span>
                    )}
                    {hasStay && (
                      <span className="flex items-center space-x-1">
                        <Hotel className="h-3.5 w-3.5 text-theme-primary" />
                        <span>Stay</span>
                      </span>
                    )}
                    {hasMeals && (
                      <span className="flex items-center space-x-1">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-theme-primary" />
                        <span>Meals</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-light">
                    Organizer Agency: <span className="font-bold text-text-secondary">{pkg.organizer?.fullName}</span>
                  </p>
                </div>

                {/* Card Footer pricing coordinates */}
                <div className="p-5 pt-0 border-t border-border-custom bg-bg-secondary/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-light font-bold">Seat Lock Fee</p>
                    <p className="text-base font-extrabold text-theme-secondary">BDT {pkg.minimumSeatLockFee}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-light font-bold text-right">Full price</p>
                    <p className="text-sm font-bold text-text-secondary text-right">BDT {pkg.totalPackagePrice}</p>
                  </div>
                </div>

                {/* Book Link Button */}
                <div className="p-5 pt-0">
                  <Link
                    href={`/tours/${pkg.id}`}
                    className="block text-center w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 text-xs hover:bg-opacity-90 transition rounded-none"
                  >
                    View Details & Book
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}