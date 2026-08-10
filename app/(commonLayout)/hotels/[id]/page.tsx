"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetHotelByIdQuery } from "@/redux/api/hotel/hotelApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Hotel, MapPin, ArrowLeft, ShieldCheck, Loader2, Bed, Check, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function HotelDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: hotelResponse, isLoading, error } = useGetHotelByIdQuery(id);
  const hotel = hotelResponse?.data;

  const { user } = useSelector((state: RootState) => state.user);
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingDays, setBookingDays] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Lightbox Zoom Modal States
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const handleOpenBooking = (room: any) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const handleConfirmSimulatedBooking = () => {
    toast.success(`Simulation: Success! Bed hold locked for ${selectedRoom?.type} room at ${hotel?.name}.`);
    setIsBookingModalOpen(false);
    setSelectedRoom(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Retrieving property inventory...</span>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 space-y-4">
        <ShieldCheck className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold text-text-primary">Hotel Not Found</h3>
        <p className="text-sm text-text-secondary">
          The requested hotel listing or inventory could not be loaded.
        </p>
        <Link href="/hotels" className="bg-btn-primary text-btn-text-primary px-6 py-2 text-xs font-bold rounded-none">
          Back to Hotels
        </Link>
      </div>
    );
  }

  const isTourOrganizer = user?.currentRole === "tour_organizer" || user?.currentRole === "admin";

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 space-y-8">
      
      {/* Back to Hotels link */}
      <Link href="/hotels" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Stays Directory</span>
      </Link>

      {/* Hotel Photos Banner */}
      <div className="w-full h-80 md:h-[400px] bg-bg-secondary border border-border-custom overflow-hidden relative rounded-none cursor-zoom-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80"}
          alt={hotel.name}
          onClick={() => setFullScreenImage(hotel.photos?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80")}
          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
        />
        {hotel.isVerified && (
          <span className="absolute top-4 right-4 z-20 bg-theme-secondary text-white px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 rounded-none">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Partner Stay</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Details & Room inventory */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Title Section */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-text-primary tracking-wide">{hotel.name}</h1>
            <p className="text-sm text-text-light flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-theme-primary shrink-0" />
              <span>{hotel.address}</span>
            </p>
          </div>

          {/* Description */}
          <div className="border-t border-border-custom pt-6 space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">About the Hotel</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {hotel.description || "Welcome to our premium hotel listing, offering guests comfortable accommodations, professional hospitality services, and a perfect central base to enjoy local tourism, sightseeing, and relaxation."}
            </p>
          </div>

          {/* Amenities checklist */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="border-t border-border-custom pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Property Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities.map((amt: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-text-secondary font-semibold">
                    <Check className="h-4 w-4 text-theme-secondary shrink-0" />
                    <span>{amt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Gallery */}
          {hotel.photos && hotel.photos.length > 1 && (
            <div className="border-t border-border-custom pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Hotel Gallery</h3>
              <div className="flex flex-wrap gap-4">
                {hotel.photos.slice(1).map((photoUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setFullScreenImage(photoUrl)}
                    className="relative w-36 h-28 border border-border-custom bg-bg-secondary overflow-hidden cursor-pointer hover:border-theme-primary transition-all group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`${hotel.name} Photo ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Inventory */}
          <div className="border-t border-border-custom pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">Available Room Options</h3>
            <div className="space-y-4">
              {(!hotel.rooms || hotel.rooms.length === 0) ? (
                <p className="text-sm text-text-light">No room rates currently configured. Check back soon.</p>
              ) : (
                hotel.rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="border border-border-custom bg-bg-primary p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none transition hover:border-text-light"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-theme-primary" />
                        <h4 className="font-semibold text-text-primary text-base">{room.type}</h4>
                      </div>
                      
                      {/* Room Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.map((amt: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-bg-secondary border border-border-custom text-text-secondary px-2 py-0.5 rounded-none font-medium"
                            >
                              {amt}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-text-light">
                        Available Inventory: <span className="font-semibold text-text-secondary">{room.inventory} Rooms</span>
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border-custom">
                      <div className="space-y-1">
                        <p className="text-[10px] text-text-light font-bold md:text-right">STANDARD PUBLIC RATE</p>
                        <p className="text-lg font-extrabold text-theme-secondary md:text-right">
                          BDT {room.b2cPrice.toLocaleString()} <span className="text-xs font-semibold text-text-light">/ Night</span>
                        </p>
                        
                        {/* B2B Wholesale Pricing for verified organizers */}
                        {isTourOrganizer && room.b2bPrice && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-1 mt-1 rounded-none flex items-center space-x-1 justify-start md:justify-end">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                            <span>B2B PARTNER RATE: BDT {room.b2bPrice.toLocaleString()} / Night</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenBooking(room)}
                        className="bg-btn-primary text-btn-text-primary font-bold py-2 px-6 text-xs hover:bg-opacity-95 transition rounded-none cursor-pointer w-full md:w-auto"
                      >
                        Book Stay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Quick Sidebar widgets */}
        <div className="space-y-6">
          <div className="bg-bg-secondary border border-border-custom p-6 space-y-4 rounded-none">
            <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="h-4 w-4 text-theme-primary" />
              <span>Stay Policies</span>
            </h4>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                <strong>Check-in:</strong> {hotel.checkInTime || "14:00"} onwards. Please bring a valid photo identification card.
              </p>
              <p>
                <strong>Check-out:</strong> {hotel.checkOutTime || "12:00"} noon. Late check-outs might be billed extra.
              </p>
              <p>
                <strong>Cancellation:</strong> Bookings cancelled 48 hours prior to check-in qualify for a full refund. Later cancellations are subject to a single night fee.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Booking Modal */}
      {isBookingModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom max-w-md w-full p-6 space-y-6 shadow-2xl rounded-none">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Confirm Simulated Booking</h3>
              <p className="text-xs text-text-light mt-1">Simulate reservation lock at {hotel.name}</p>
            </div>

            <div className="space-y-4 text-sm text-text-secondary border-y border-border-custom py-4">
              <p><strong>Selected Room:</strong> {selectedRoom.type}</p>
              <div className="flex items-center justify-between">
                <label className="font-bold text-text-secondary">Number of Nights:</label>
                <input
                  type="number"
                  min={1}
                  value={bookingDays}
                  onChange={(e) => setBookingDays(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-center border border-border-custom bg-bg-secondary text-text-primary outline-none focus:border-theme-primary rounded-none"
                />
              </div>
              <div className="flex justify-between border-t border-border-custom pt-3 mt-3">
                <span className="font-bold text-text-primary">Total Est. Cost:</span>
                <span className="font-extrabold text-theme-secondary text-base">
                  BDT {(bookingDays * selectedRoom.b2cPrice).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-1/2 border border-border-custom text-text-secondary font-bold py-2.5 text-xs hover:bg-bg-secondary transition rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSimulatedBooking}
                className="w-1/2 bg-btn-primary text-btn-text-primary font-bold py-2.5 text-xs hover:bg-opacity-95 transition rounded-none cursor-pointer"
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {fullScreenImage && (
        <div
          onClick={() => setFullScreenImage(null)}
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullScreenImage}
              alt="Full screen gallery view"
              className="max-h-full object-contain shadow-2xl"
            />
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/85 p-2 rounded-full border border-gray-700 font-extrabold text-sm w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
