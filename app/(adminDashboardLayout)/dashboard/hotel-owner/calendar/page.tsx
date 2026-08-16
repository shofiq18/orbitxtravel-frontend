"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useBlockRoomDatesMutation,
  useGetBlockedRoomDatesQuery,
} from "@/redux/api/hotel/hotelApi";
import { Calendar as CalendarIcon, ShieldCheck, Loader2, Lock, ArrowRight, Bed, Calendar, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function HotelCalendarPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is hotel owner
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.currentRole !== "hotel_owner") {
      toast.error("Access Denied: Please log in as a Hotel Owner to view this portal.");
      router.push("/");
    }
  }, [user, router]);

  // API Hooks
  const { data: hotelsResponse, isLoading: isLoadingHotels, refetch: refetchHotels } = useGetHotelsQuery({
    ownerId: user?.id,
  });
  const myHotels = hotelsResponse?.data || [];
  const activeHotel = myHotels[0];

  const [blockDates, { isLoading: isBlocking }] = useBlockRoomDatesMutation();

  // Block Dates States
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");

  // Query Blocked Dates
  const { data: blockedDatesResponse, isLoading: isLoadingBlocked, refetch: refetchBlocked } = useGetBlockedRoomDatesQuery(
    { roomId: selectedRoomId },
    { skip: !selectedRoomId }
  );
  const blockedDates = blockedDatesResponse?.data || [];

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !blockStart || !blockEnd) {
      toast.error("Please select a room and calendar date range.");
      return;
    }

    // Generate dates range array YYYY-MM-DD
    const getDatesBetween = (startStr: string, endStr: string) => {
      const dateList: string[] = [];
      let current = new Date(startStr);
      const end = new Date(endStr);
      while (current <= end) {
        dateList.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dateList;
    };

    const dates = getDatesBetween(blockStart, blockEnd);

    try {
      const response = await blockDates({
        roomId: selectedRoomId,
        body: {
          dates,
          reason: "Offline booking lock",
        },
      }).unwrap();

      toast.success(response?.message || "Room calendar dates locked out successfully!");
      setBlockStart("");
      setBlockEnd("");
      refetchBlocked();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to lock room dates.");
    }
  };

  if (isLoadingHotels) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-primary">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading calendar workspace...</span>
        </div>
      </div>
    );
  }

  if (!activeHotel) {
    return (
      <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] text-center space-y-4 bg-bg-primary">
        <h1 className="text-xl font-semibold text-text-primary">No Property Linked</h1>
        <p className="text-sm text-text-secondary">Please complete your Hotel Property list setup first on the Overview tab.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-custom pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Availability Calendar</h1>
          <p className="text-sm text-text-light mt-1">Block room types from public searches for offline and maintenance purposes.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-theme-secondary/10 border border-theme-secondary/20 px-4 py-2 text-xs font-bold text-theme-secondary rounded-none">
          <ShieldCheck className="h-4 w-4" />
          <span>Property Linked: {activeHotel.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Block Date Form */}
        <form onSubmit={handleBlockDates} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            Block Out Calendar Dates
          </h3>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Select Room Type *</label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none"
            >
              <option value="">-- Choose Room Type --</option>
              {activeHotel.rooms?.map((rm: any) => (
                <option key={rm.id} value={rm.id}>
                  {rm.type} ({rm.inventory} Left)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">End Date *</label>
              <input
                type="date"
                required
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary rounded-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isBlocking}
            className="w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer pt-3"
          >
            {isBlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4.5 w-4.5" />}
            <span>Lock Availability</span>
          </button>
        </form>

        {/* Locked Dates List */}
        <div className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            Active Calendar Blocks
          </h3>
          
          <div className="p-3 bg-bg-secondary border border-border-custom rounded-none text-xs text-text-secondary space-y-2">
            <p className="font-bold flex items-center space-x-1.5 text-text-primary">
              <Info className="h-4 w-4 text-theme-primary shrink-0" />
              <span>Note on Date Blocks:</span>
            </p>
            <p>Rooms blocked under this panel will be removed from B2C searches for the chosen date range.</p>
          </div>
          
          {selectedRoomId ? (
            isLoadingBlocked ? (
              <div className="flex items-center justify-center py-4 text-xs text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading active blocks...</span>
              </div>
            ) : blockedDates.length === 0 ? (
              <p className="text-xs text-text-light italic text-center py-4 border border-dashed border-border-custom rounded-none bg-bg-secondary/10">
                No active calendar blocks scheduled for this room.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {blockedDates.map((block: any) => (
                  <div key={block.id} className="p-2.5 border border-border-custom bg-bg-secondary/20 rounded-none text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-text-primary">
                        {new Date(block.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      <p className="text-[10px] text-text-light">{block.reason}</p>
                    </div>
                    <span className="bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 text-[9px] font-bold rounded-none">BLOCKED</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-[10px] text-text-light italic text-center py-4 border border-dashed border-border-custom rounded-none">
              Select a room above to monitor blocked schedules.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
