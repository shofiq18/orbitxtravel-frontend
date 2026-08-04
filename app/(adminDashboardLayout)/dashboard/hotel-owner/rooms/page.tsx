"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useCreateRoomMutation,
} from "@/redux/api/hotel/hotelApi";
import { Bed, ShieldCheck, Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function HotelRoomsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is hotel owner
  if (!user || user.currentRole !== "hotel_owner") {
    toast.error("Access Denied: Please log in as a Hotel Owner to view this portal.");
    router.push("/");
  }

  // API Hooks
  const { data: hotelsResponse, isLoading: isLoadingHotels, refetch: refetchHotels } = useGetHotelsQuery({
    ownerId: user?.id,
  });
  const myHotels = hotelsResponse?.data || [];
  const activeHotel = myHotels[0];

  const [createRoom, { isLoading: isCreatingRoom }] = useCreateRoomMutation();

  // Create Room Form States
  const [roomType, setRoomType] = useState("");
  const [roomB2C, setRoomB2C] = useState("");
  const [roomB2B, setRoomB2B] = useState("");
  const [inventory, setInventory] = useState("5");
  const [roomAmenities, setRoomAmenities] = useState("King Bed, AC, Mini Fridge");

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotel) return;
    if (!roomType || !roomB2C || !roomB2B) {
      toast.error("Please fill in all room pricing metrics.");
      return;
    }

    try {
      const response = await createRoom({
        hotelId: activeHotel.id,
        body: {
          type: roomType,
          amenities: roomAmenities.split(",").map((a) => a.trim()),
          inventory: Number(inventory),
          b2cPrice: Number(roomB2C),
          b2bPrice: Number(roomB2B),
          photos: ["https://cloudinary.com/room_default.jpg"],
        },
      }).unwrap();
      
      toast.success(response?.message || "Room type listed successfully!");
      setRoomType("");
      setRoomB2C("");
      setRoomB2B("");
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create room.");
    }
  };

  if (isLoadingHotels) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-primary">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading room workspace...</span>
        </div>
      </div>
    );
  }

  if (!activeHotel) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] text-center space-y-4 bg-bg-primary">
        <h1 className="text-xl font-bold text-text-primary">No Property Linked</h1>
        <p className="text-sm text-text-secondary">Please complete your Hotel Property list setup first on the Overview tab.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-custom pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Room Inventory Management</h1>
          <p className="text-sm text-text-light mt-1">Configure individual suite types, rates, and B2B pricing locks.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-theme-secondary/10 border border-theme-secondary/20 px-4 py-2 text-xs font-bold text-theme-secondary rounded-none">
          <ShieldCheck className="h-4 w-4" />
          <span>Property Linked: {activeHotel.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <form onSubmit={handleCreateRoom} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-bold text-text-primary tracking-wide border-b border-border-custom pb-2">
            List a New Room Type
          </h3>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Room Type Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deluxe Couple Suite Ocean View"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Capacity Inventory *</label>
            <input
              type="number"
              required
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Public B2C Rate (BDT per night) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 6500"
              value={roomB2C}
              onChange={(e) => setRoomB2C(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Locked Partner B2B Rate (BDT wholesale) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 4800"
              value={roomB2B}
              onChange={(e) => setRoomB2B(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Room Amenities (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. King Bed, Air Conditioning, Balcony"
              value={roomAmenities}
              onChange={(e) => setRoomAmenities(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingRoom}
            className="w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer pt-3"
          >
            {isCreatingRoom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Add Room Type</span>
          </button>
        </form>

        {/* Existing Rooms list (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-text-primary tracking-wide">Existing Room Types</h3>
          
          {(!activeHotel.rooms || activeHotel.rooms.length === 0) ? (
            <div className="text-center py-8 border border-dashed border-border-custom bg-bg-primary rounded-none">
              <Bed className="h-8 w-8 text-text-light mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-bold">No rooms listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeHotel.rooms.map((rm: any) => (
                <div key={rm.id} className="border border-border-custom bg-bg-primary p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none">
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary text-sm">{rm.type}</h4>
                    <p className="text-[10px] text-text-light font-bold">ID: <span className="font-mono">{rm.id}</span></p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rm.amenities.map((am: string, i: number) => (
                        <span key={i} className="bg-bg-secondary border border-border-custom px-2 py-0.5 text-[10px] text-text-secondary rounded-none">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-right shrink-0">
                    <div>
                      <p className="text-[10px] text-text-light font-bold">B2C Public</p>
                      <p className="text-sm font-bold text-text-primary">BDT {rm.b2cPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-light font-bold">B2B Wholesale</p>
                      <p className="text-sm font-bold text-theme-secondary">BDT {rm.b2bPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-light font-bold">Inventory</p>
                      <p className="text-sm font-extrabold text-theme-primary">{rm.inventory} Rooms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
