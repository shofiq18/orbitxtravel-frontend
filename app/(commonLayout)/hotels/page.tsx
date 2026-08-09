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
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Find Hotels & Luxury Stays</h1>
        <p className="text-sm text-text-secondary">
          Browse verified hotel listings and lock-in your travel accommodations.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="max-w-4xl mx-auto bg-bg-primary border border-border-custom p-4 md:p-6 text-text-primary rounded-none shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Destination Input (Bed/Hotel Icon) */}
          <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
            <Hotel className="h-5 w-5 text-text-light shrink-0" />
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

          {/* Dates Picker Box */}
          <div className="flex items-center space-x-3 bg-bg-secondary border border-border-custom p-2.5 rounded-none focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary transition-all md:col-span-2 text-left">
            <Calendar className="h-5 w-5 text-text-light shrink-0" />
            <div className="grid grid-cols-2 gap-2 flex-grow">
              <div>
                <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Check-in date</span>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-xs text-text-primary outline-none mt-0.5"
                />
              </div>
              <div className="border-l border-border-custom pl-2">
                <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Check-out date</span>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
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
              <span>Search Stays</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Listing View Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-custom pb-4">
          <h3 className="text-xl font-bold text-text-primary tracking-tight">Available Accommodations</h3>
          <span className="text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-custom px-3 py-1.5 rounded-none">
            {hotelsList.length} Stays Found
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border-custom p-4 space-y-4 animate-pulse bg-bg-primary">
                <div className="h-48 bg-bg-secondary w-full animate-pulse"></div>
                <div className="h-4 bg-bg-secondary w-2/3 animate-pulse"></div>
                <div className="h-4 bg-bg-secondary w-1/2 animate-pulse"></div>
              </div>
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
            <h4 className="text-lg font-bold text-text-primary">No Hotels Match Search</h4>
            <p className="text-sm text-text-secondary mt-1">Try resetting your location search or verification filters.</p>
          </div>
        )}

        {/* Hotels Card Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hotelsList.map((hotel: any) => {
            const rooms = hotel.rooms || [];
            const startingPrice = rooms.length > 0
              ? Math.min(...rooms.map((r: any) => r.b2cPrice))
              : null;

            return (
              <div
                key={hotel.id}
                className="bg-bg-primary border border-border-custom flex flex-col justify-between transition-all duration-300 hover:shadow-lg rounded-none group"
              >
                {/* Image Cover */}
                <div className="relative h-48 w-full bg-bg-secondary overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Verification Badge */}
                  {hotel.isVerified && (
                    <span className="absolute top-3 right-3 z-20 bg-theme-secondary text-white px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 rounded-none">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Stay</span>
                    </span>
                  )}
                </div>

                {/* Card Info details */}
                <div className="p-5 flex-grow space-y-4">
                  <h4 className="text-lg font-bold text-text-primary group-hover:text-theme-primary transition-colors leading-tight line-clamp-1">
                    {hotel.name}
                  </h4>
                  <p className="text-xs text-text-light flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-theme-primary shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </p>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {hotel.description || "Premium hotel listing offering beautiful views, comfort, and state-of-the-art facilities."}
                  </p>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {hotel.amenities.slice(0, 4).map((amt: string, idx: number) => (
                        <span key={idx} className="bg-bg-secondary border border-border-custom text-text-secondary text-[10px] px-2 py-0.5 rounded-none font-semibold">
                          {amt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer pricing */}
                <div className="p-5 pt-0 border-t border-border-custom bg-bg-secondary/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-light font-bold">Standard Rate</p>
                    <p className="text-base font-extrabold text-theme-secondary">
                      {startingPrice ? `BDT ${startingPrice} / Night` : "Contact for rates"}
                    </p>
                  </div>
                </div>

                {/* CTA Action */}
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
