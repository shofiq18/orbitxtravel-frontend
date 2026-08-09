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

          {/* Search Tabs */}
          <div className="max-w-4xl mx-auto mt-8 flex justify-start space-x-1">
            <button
              type="button"
              onClick={() => {
                setSearchTab("tours");
              }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
                searchTab === "tours"
                  ? "bg-btn-primary text-btn-text-primary"
                  : "bg-bg-primary text-text-primary border border-border-custom hover:bg-bg-secondary"
              }`}
            >
              Tour Packages
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTab("hotels");
              }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
                searchTab === "hotels"
                  ? "bg-btn-primary text-btn-text-primary"
                  : "bg-bg-primary text-text-primary border border-border-custom hover:bg-bg-secondary"
              }`}
            >
              Hotels & Stays
            </button>
          </div>

          {/* Search Inputs Container */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary rounded-none shadow-2xl"
          >
            {searchTab === "tours" ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Destination Search */}
                <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
                  <MapPin className="absolute left-3 top-4 h-5 w-5 text-text-light shrink-0" />
                  <div className="flex-grow pl-7">
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

                {/* Travel Dates Range Picker (Red Clock Icon) */}
                <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
                  <Clock className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    <div>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Travel from</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5"
                      />
                    </div>
                    <div className="border-l border-border-custom pl-2">
                      <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Travel to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5"
                      />
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

                {/* Dates Picker Box */}
                <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
                  <Calendar className="h-5 w-5 text-text-light shrink-0" />
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    <div>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Check-in date</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5"
                      />
                    </div>
                    <div className="border-l border-border-custom pl-2">
                      <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Check-out date</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5"
                      />
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
                    src={(pkg.inclusions as any)?.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80"}
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

      {/* Featured Hotels Section */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-6 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-border-custom pb-4">
          <div>
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">Featured Hotels</h3>
            <p className="text-sm text-text-light mt-1">Direct bookings on verified premium hotels & stays.</p>
          </div>
          <Link href="/hotels" className="text-sm font-bold text-theme-primary hover:underline">
            View All Hotels &rarr;
          </Link>
        </div>

        {/* Loading / Error States for Hotels */}
        {isLoadingHotels && (
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
            <h4 className="text-lg font-bold text-text-primary">No Hotels Available</h4>
            <p className="text-sm text-text-secondary mt-1">Check back later for newly added properties.</p>
          </div>
        )}

        {/* Hotels Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hotelsList.slice(0, 3).map((hotel: any) => {
            const rooms = hotel.rooms || [];
            const startingPrice = rooms.length > 0
              ? Math.min(...rooms.map((r: any) => r.b2cPrice))
              : null;

            return (
              <div
                key={hotel.id}
                className="bg-bg-primary border border-border-custom flex flex-col justify-between transition-all duration-300 hover:shadow-lg rounded-none group"
              >
                {/* Hotel Image */}
                <div className="relative h-48 w-full bg-bg-secondary overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Verified Badge */}
                  {hotel.isVerified && (
                    <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Stay</span>
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow space-y-4">
                  <h4 className="text-lg font-bold text-text-primary group-hover:text-theme-primary transition-colors leading-tight line-clamp-1">
                    {hotel.name}
                  </h4>
                  <p className="text-xs text-text-light flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-theme-primary shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </p>
                  
                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {hotel.description || "Premium luxury hotel stay offering modern amenities and world-class service."}
                  </p>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {hotel.amenities.slice(0, 3).map((amt: string, idx: number) => (
                        <span key={idx} className="bg-bg-secondary border border-border-custom text-text-secondary text-[10px] px-2 py-0.5 rounded-none font-semibold">
                          {amt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing / Booking Action */}
                <div className="p-5 pt-0 border-t border-border-custom bg-bg-secondary/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-light font-bold">Standard Rate</p>
                    <p className="text-base font-extrabold text-theme-secondary">
                      {startingPrice ? `BDT ${startingPrice} / Night` : "Contact for rates"}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/hotels/${hotel.id}`}
                    className="block text-center w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 text-xs hover:bg-opacity-90 transition rounded-none"
                  >
                    View Details
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