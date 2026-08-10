"use client";

import { useState } from "react";
import { useGetHotelsQuery } from "@/redux/api/hotel/hotelApi";
import { Hotel, MapPin, Search, ShieldCheck, AlertTriangle, Loader2, Calendar } from "lucide-react";
import Link from "next/link";

export default function FindHotelsPage() {
  const [addressInput, setAddressInput] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  const [searchParams, setSearchParams] = useState<{
    address?: string;
    verifiedOnly?: string;
  }>({});

  const { data: hotelsResponse, isLoading, error } = useGetHotelsQuery(searchParams);
  const hotelsList = hotelsResponse?.data || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: typeof searchParams = {};
    if (addressInput) params.address = addressInput;
    if (verifiedOnly) params.verifiedOnly = "true";
    setSearchParams(params);
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
            Find Hotels & Luxury Stays
          </h1>
          <p className=" text-base md:text-lg max-w-xl mx-auto">
            Browse verified hotel listings and lock-in your travel accommodations.
          </p>
        </div>
      </section>

      {/* Floating Search Section */}
      <div className="relative z-30 max-w-4xl mx-auto px-8 lg:px-0 -mt-26">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary rounded-none shadow-2xl"
        >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Destination Input (Bed/Hotel Icon) */}
          <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
            <MapPin className="h-5 w-5 text-text-light shrink-0" />
            <div className="flex-grow">
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Enter destination</span>
              <input
                type="text"
                placeholder="Where are you going?"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
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
                  {checkInDate && checkOutDate 
                    ? `${checkInDate} to ${checkOutDate}`
                    : checkInDate 
                    ? `From ${checkInDate}`
                    : checkOutDate 
                    ? `To ${checkOutDate}`
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
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5 cursor-pointer text-left"
                    />
                  </div>
                  <div className="bg-bg-secondary border border-border-custom p-2 rounded-none">
                    <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider">Check-Out</span>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
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
              <span>Search Stays</span>
            </button>
          </div>
        </div>
      </form>
      </div>

      {/* Main Listing View Grid */}
      <section className="w-full mx-auto px-8 lg:px-16 space-y-6">
        <div className="flex items-center justify-between border-b border-border-custom pb-4">
          <h3 className="text-xl font-semibold text-text-primary tracking-wide">Available Accommodations</h3>
          <span className="text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-custom px-3 py-1.5 rounded-none">
            {hotelsList.length} Stays Found
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[480px] border border-border-custom animate-pulse bg-bg-primary w-full"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3 rounded-none max-w-xl mx-auto my-12">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading stays</p>
              <p className="text-xs">Unable to load hotel catalog from server. Check your network or API status.</p>
            </div>
          </div>
        )}

        {/* Empty List State */}
        {!isLoading && !error && hotelsList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary max-w-md mx-auto rounded-none">
            <Hotel className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-text-primary">No Hotels Match Search</h4>
            <p className="text-sm text-text-secondary mt-1">Try resetting your location search or verification filters.</p>
          </div>
        )}

        {/* Hotels Card Listing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hotelsList.map((hotel: any) => {
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
