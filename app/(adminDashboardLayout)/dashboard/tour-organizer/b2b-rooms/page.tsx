"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetHotelsQuery, useGetHotelByIdQuery } from "@/redux/api/hotel/hotelApi";
import { Hotel, Loader2, ShieldCheck, ArrowRight, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function TourB2BRoomsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is tour organizer
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.currentRole !== "tour_organizer") {
      toast.error("Access Denied: Please log in as a Tour Organizer to view this portal.");
      router.push("/");
    }
  }, [user, router]);

  // API Hooks
  const [searchHotelName, setSearchHotelName] = useState("");
  const { data: hotelsResponse, isLoading: isLoadingHotels } = useGetHotelsQuery({
    name: searchHotelName || undefined,
  });
  const hotelsList = hotelsResponse?.data || [];

  // Selected Hotel details for B2B locking
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const { data: hotelDetailsResponse, isLoading: isLoadingDetails } = useGetHotelByIdQuery(selectedHotelId, {
    skip: !selectedHotelId,
  });
  const selectedHotel = hotelDetailsResponse?.data;

  // Local Room Hold locking inputs
  const [holdStart, setHoldStart] = useState("");
  const [holdEnd, setHoldEnd] = useState("");
  const [holdQty, setHoldQty] = useState("1");

  const handlePlaceB2BHold = (room: any) => {
    if (!holdStart || !holdEnd) {
      toast.error("Please select a check-in and check-out date first.");
      return;
    }
    
    // Simulate placing a B2B room lock hold and append to memory in LocalStorage
    const newHold = {
      roomId: room.id,
      roomType: room.type,
      quantity: Number(holdQty),
      checkInDate: holdStart,
      checkOutDate: holdEnd,
    };

    let currentHolds = [];
    const savedHolds = localStorage.getItem("active_b2b_holds");
    if (savedHolds) {
      try {
        currentHolds = JSON.parse(savedHolds);
      } catch (e) {
        console.error(e);
      }
    }

    currentHolds.push(newHold);
    localStorage.setItem("active_b2b_holds", JSON.stringify(currentHolds));
    toast.success(`Placed a 24-hour B2B room lock hold on "${room.type}"! Hold synchronized.`);
    router.push("/dashboard/tour-organizer");
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      {/* Page Title */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Lock B2B Partner Rooms</h1>
        <p className="text-sm text-text-light mt-1">Acquire B2B partner inventory at negotiated rates and place temporary booking holds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Search and results list column (Col 1) */}
        <div className="space-y-6">
          <div className="border border-border-custom bg-bg-primary p-4 rounded-none">
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Search Hotel Partner</label>
            <input
              type="text"
              placeholder="e.g. Grand Palace"
              value={searchHotelName}
              onChange={(e) => setSearchHotelName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
            />
          </div>

          {isLoadingHotels ? (
            <div className="flex items-center space-x-2 text-text-secondary justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading hotels...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {hotelsList.map((hotel: any) => (
                <button
                  key={hotel.id}
                  onClick={() => setSelectedHotelId(hotel.id)}
                  className={`w-full text-left p-4 border block transition rounded-none cursor-pointer ${ selectedHotelId === hotel.id ? "border-theme-primary bg-bg-secondary" : "border-border-custom bg-bg-primary hover:bg-bg-secondary" }`}
                >
                  <h4 className="font-semibold text-text-primary text-sm leading-snug">{hotel.name}</h4>
                  <p className="text-xs text-text-light mt-1">{hotel.address}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room listing & B2B locks column (Col 2) */}
        <div className="lg:col-span-2">
          
          {!selectedHotelId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-custom bg-bg-primary/20 rounded-none">
              <Hotel className="h-10 w-10 text-text-light mb-2" />
              <p className="text-sm font-bold text-text-secondary">No Hotel Selected</p>
              <p className="text-xs text-text-light mt-1">Select a hotel from the left list to review rooms and locked B2B rates.</p>
            </div>
          ) : isLoadingDetails ? (
            <div className="flex items-center space-x-2 text-text-secondary justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fetching wholesale rates...</span>
            </div>
          ) : !selectedHotel ? (
            <div className="text-center p-6 text-red-500">Failed to load property details.</div>
          ) : (
            <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
              <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                  <span>{selectedHotel.name}</span>
                  {selectedHotel.isVerified && <ShieldCheck className="h-5 w-5 text-theme-secondary shrink-0" />}
                </h3>
                <p className="text-xs text-text-light mt-1">{selectedHotel.address}</p>
              </div>

              {/* Room holdings block-date settings */}
              <div className="bg-bg-secondary border border-border-custom p-4 space-y-4 rounded-none">
                <p className="font-bold text-text-primary text-xs flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-theme-primary shrink-0" />
                  <span>Set Booking Hold Duration</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary mb-1">Check In *</label>
                    <input
                      type="date"
                      value={holdStart}
                      onChange={(e) => setHoldStart(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-text-primary bg-bg-primary border border-border-custom outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary mb-1">Check Out *</label>
                    <input
                      type="date"
                      value={holdEnd}
                      onChange={(e) => setHoldEnd(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-text-primary bg-bg-primary border border-border-custom outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={holdQty}
                      onChange={(e) => setHoldQty(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-text-primary bg-bg-primary border border-border-custom outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* Room Lists */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-text-primary">Available Wholesale Rooms</h4>
                
                {(!selectedHotel.rooms || selectedHotel.rooms.length === 0) ? (
                  <div className="text-xs text-text-light text-center py-4 italic border border-border-custom rounded-none">
                    No rooms listed by owner.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room: any) => (
                      <div key={room.id} className="border border-border-custom bg-bg-secondary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none">
                        <div className="space-y-1">
                          <p className="font-bold text-text-primary text-sm">{room.type}</p>
                          <p className="text-[10px] text-text-light">Capacity: {room.inventory} Rooms available</p>
                          
                          {/* Display rates */}
                          <div className="flex items-center space-x-4 pt-1">
                            <span className="text-xs text-text-light font-medium line-through">B2C: BDT {room.b2cPrice}</span>
                            <span className="text-xs text-theme-secondary font-bold">B2B Rate: BDT {room.b2bPrice}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePlaceB2BHold(room)}
                          className="bg-theme-primary text-text-white font-bold py-2 px-4 hover:bg-opacity-95 transition shrink-0 flex items-center space-x-1.5 cursor-pointer text-xs tracking-wide rounded-none"
                        >
                          <span>Select Hold</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
