"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} from "@/redux/api/hotel/hotelApi";
import { useGetBookingsByUserQuery } from "@/redux/api/booking/bookingApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { 
  Home, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function HotelPropertyPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is hotel owner
  useEffect(() => {
    if (!user || user.currentRole !== "hotel_owner") {
      toast.error("Access Denied: Please log in as a Hotel Owner to view this portal.");
      router.push("/");
    }
  }, [user, router]);

  // Dashboard view mode: "hotels", "bookings", "create", "edit"
  const [view, setView] = useState<"hotels" | "bookings" | "create" | "edit">("hotels");
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);

  // Selected hotel modal state for drill-down
  const [selectedHotelForModal, setSelectedHotelForModal] = useState<any | null>(null);

  // Search filter for hotel bookings
  const [bookingSearch, setBookingSearch] = useState("");

  // API Hooks
  const { data: hotelsResponse, isLoading: isLoadingHotels, refetch: refetchHotels } = useGetHotelsQuery({
    ownerId: user?.id,
  });
  const myHotels = hotelsResponse?.data || [];

  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookingsByUserQuery(undefined, {
    skip: !user || user.currentRole !== "hotel_owner",
  });
  const hotelBookings = bookingsResponse?.data || [];

  const [createHotel, { isLoading: isCreatingHotel }] = useCreateHotelMutation();
  const [updateHotel, { isLoading: isUpdatingHotel }] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();
  const [uploadFile] = useUploadFileMutation();

  // Hotel Form States
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("Wi-Fi, Swimming Pool, Ocean View");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");

  const [coverPhoto, setCoverPhoto] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleEditClick = (hotel: any) => {
    setEditingHotelId(hotel.id);
    setHotelName(hotel.name);
    setHotelAddress(hotel.address);
    setHotelDesc(hotel.description || "");
    setAmenitiesText((hotel.amenities || []).join(", "));
    setCheckInTime(hotel.checkInTime || "14:00");
    setCheckOutTime(hotel.checkOutTime || "12:00");
    setCoverPhoto(hotel.photos?.[0] || "");
    setGalleryPhotos(hotel.photos?.slice(1) || []);
    setView("edit");
  };

  const handleCancelClick = () => {
    setView("hotels");
    setEditingHotelId(null);
    clearForm();
  };

  const clearForm = () => {
    setHotelName("");
    setHotelAddress("");
    setHotelDesc("");
    setAmenitiesText("Wi-Fi, Swimming Pool, Ocean View");
    setCheckInTime("14:00");
    setCheckOutTime("12:00");
    setCoverPhoto("");
    setGalleryPhotos([]);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this hotel property? This action is permanent.")) {
      try {
        await deleteHotel(id).unwrap();
        toast.success("Hotel property deleted successfully!");
        refetchHotels();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete hotel.");
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadFile({ file: reader.result as string }).unwrap();
        if (res?.success && res?.data) {
          setCoverPhoto(res.data);
          toast.success("Cover photo uploaded successfully!");
        }
      } catch (err: any) {
        toast.error("Failed to upload cover photo.");
      } finally {
        setIsUploadingCover(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const res = await uploadFile({ file: base64 }).unwrap();
        if (res?.success && res?.data) {
          uploadedUrls.push(res.data);
        }
      }
      setGalleryPhotos(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} gallery photos uploaded successfully!`);
    } catch (err: any) {
      toast.error("Failed to upload photos.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !hotelAddress) {
      toast.error("Please fill in required fields.");
      return;
    }

    if (!coverPhoto) {
      toast.error("Hotel Cover photo is required.");
      return;
    }

    const payload = {
      name: hotelName,
      address: hotelAddress,
      description: hotelDesc,
      amenities: amenitiesText.split(",").map((a) => a.trim()),
      photos: [coverPhoto, ...galleryPhotos],
      checkInTime,
      checkOutTime,
    };

    try {
      if (view === "edit" && editingHotelId) {
        await updateHotel({ id: editingHotelId, body: payload }).unwrap();
        toast.success("Hotel property details updated successfully!");
      } else {
        await createHotel(payload).unwrap();
        toast.success("Hotel property created successfully!");
      }
      clearForm();
      setView("hotels");
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process hotel details.");
    }
  };

  const filteredHotelBookings = hotelBookings.filter((b: any) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    const hName = (b.hotel?.name || "").toLowerCase();
    const rName = (b.room?.title || b.room?.type || "").toLowerCase();
    const gName = (b.traveler?.fullName || "").toLowerCase();
    const gEmail = (b.traveler?.email || "").toLowerCase();
    return hName.includes(q) || rName.includes(q) || gName.includes(q) || gEmail.includes(q);
  });

  const selectedHotelBookings = selectedHotelForModal
    ? hotelBookings.filter((b: any) => b.hotelId === selectedHotelForModal.id)
    : [];

  if (!user || user.currentRole !== "hotel_owner") {
    return null;
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh] space-y-8">
      
      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border-custom pb-3">
        <button
          onClick={() => setView("hotels")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            view === "hotels"
              ? "bg-theme-primary text-white"
              : "bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>My Hotel Properties ({myHotels.length})</span>
        </button>

        <button
          onClick={() => setView("bookings")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            view === "bookings"
              ? "bg-theme-primary text-white"
              : "bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>All Guest Reservations ({hotelBookings.length})</span>
        </button>
      </div>

      {/* View 1: Properties List View */}
      {view === "hotels" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-5 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Property Management</h1>
              <p className="text-sm text-text-light mt-1">Configure property features, check-in settings, and view listed hotels.</p>
            </div>
            <button
              onClick={() => {
                clearForm();
                setView("create");
              }}
              className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-5 text-xs hover:bg-opacity-95 transition rounded-xl flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Link Hotel Property</span>
            </button>
          </div>

          {isLoadingHotels ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
            </div>
          ) : myHotels.length === 0 ? (
            <div className="max-w-2xl mx-auto border border-border-custom bg-bg-primary p-6 md:p-10 text-center rounded-2xl space-y-4">
              <Home className="h-10 w-10 text-theme-primary mx-auto" />
              <h3 className="text-xl font-semibold text-text-primary">List Your Hotel Property</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                You haven&apos;t linked any hotel properties yet. Setup your first property listing to start receiving guest bookings!
              </p>
              <button
                onClick={() => setView("create")}
                className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-6 text-xs hover:bg-opacity-90 transition rounded-xl cursor-pointer"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myHotels.map((hotel: any) => {
                const propertyBookings = hotelBookings.filter((b: any) => b.hotelId === hotel.id);

                return (
                  <div key={hotel.id} className="border border-border-custom bg-bg-primary flex flex-col justify-between rounded-2xl overflow-hidden hover:shadow-md transition duration-300">
                    <div>
                      <div className="h-56 bg-bg-secondary relative border-b border-border-custom/50">
                        {hotel.photos?.[0] ? (
                          <img
                            src={hotel.photos[0]}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-light text-xs font-semibold">
                            No Property Image
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
                          {hotel.isVerified ? (
                            <span className="bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-wide rounded-full">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-amber-600 text-white font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-wide rounded-full">
                              Pending Verification
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-text-primary text-lg line-clamp-1">{hotel.name}</h3>
                          <p className="text-xs text-text-light font-semibold flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-text-light shrink-0" />
                            <span className="truncate">{hotel.address}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary border-t border-b border-border-custom/40 py-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-text-light font-bold block uppercase tracking-wider">Check-in</span>
                            <span className="font-semibold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{hotel.checkInTime || "14:00"}</span>
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-text-light font-bold block uppercase tracking-wider">Check-out</span>
                            <span className="font-semibold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{hotel.checkOutTime || "12:00"}</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                          {hotel.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-border-custom/40 bg-bg-secondary/20 space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedHotelForModal(hotel)}
                        className="w-full bg-theme-primary hover:bg-opacity-95 text-white font-bold py-2 text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer rounded-xl shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Guest Reservations ({propertyBookings.length})</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(hotel)}
                          className="flex-1 bg-bg-primary hover:bg-bg-secondary border border-border-custom text-text-primary font-bold py-1.5 text-xs transition flex items-center justify-center space-x-1 cursor-pointer rounded-xl"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(hotel.id)}
                          className="flex-1 bg-transparent hover:bg-red-50 border border-red-200 text-red-600 font-bold py-1.5 text-xs transition flex items-center justify-center space-x-1 cursor-pointer rounded-xl"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Property Specific Reservations Drill-Down Modal */}
      {selectedHotelForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom max-w-3xl w-full rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border-custom pb-4">
              <div>
                <span className="text-[10px] font-bold text-theme-primary uppercase tracking-wider block">PROPERTY RESERVATIONS DRILL-DOWN</span>
                <h3 className="text-lg font-bold text-text-primary">{selectedHotelForModal.name}</h3>
                <p className="text-xs text-text-light mt-0.5">
                  Address: {selectedHotelForModal.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHotelForModal(null)}
                className="p-1.5 text-text-light hover:text-text-primary hover:bg-bg-secondary rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reservations Table */}
            {selectedHotelBookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border-custom rounded-xl space-y-2">
                <Users className="h-8 w-8 text-text-light mx-auto" />
                <p className="text-xs font-semibold text-text-primary">No Guest Bookings Yet</p>
                <p className="text-[11px] text-text-light">You have not received any guest reservations for this property yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border-custom rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-custom bg-bg-secondary/60 text-text-light uppercase tracking-wider text-[10px]">
                      <th className="p-3">Guest Details</th>
                      <th className="p-3">Room Category</th>
                      <th className="p-3">Check-In / Out</th>
                      <th className="p-3">Rooms</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/50 text-text-primary">
                    {selectedHotelBookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-bg-secondary/30 transition">
                        <td className="p-3">
                          <div className="font-semibold text-text-primary">{b.traveler?.fullName || "Guest"}</div>
                          <div className="text-[10px] text-text-light">{b.traveler?.email}</div>
                        </td>
                        <td className="p-3 font-semibold text-text-primary">
                          {b.room?.title || b.room?.type || "Standard Room"}
                        </td>
                        <td className="p-3 font-semibold text-text-primary">
                          <div>In: {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : "N/A"}</div>
                          <div className="text-text-light">Out: {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : "N/A"}</div>
                        </td>
                        <td className="p-3 font-bold text-text-primary">
                          {b.roomQuantity || 1} Room(s)
                        </td>
                        <td className="p-3 font-bold text-text-primary">
                          BDT {b.totalAmount?.toLocaleString()}
                        </td>
                        <td className="p-3">
                          {b.bookingStatus === "CONFIRMED" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Confirmed
                            </span>
                          )}
                          {b.bookingStatus === "PENDING" && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Verifying
                            </span>
                          )}
                          {b.bookingStatus === "CANCELLED" && (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border-custom">
              <button
                type="button"
                onClick={() => setSelectedHotelForModal(null)}
                className="px-4 py-2 bg-bg-secondary text-text-primary font-semibold text-xs rounded-xl hover:bg-opacity-80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Guest Reservations View */}
      {view === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">All Guest Reservations</h1>
              <p className="text-xs text-text-light mt-1">Manage check-in schedules and guest room reservations across all your properties.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-light" />
              <input
                type="text"
                placeholder="Search hotel, room, or guest..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary transition"
              />
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="flex items-center justify-center py-20 text-text-secondary space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
              <span className="text-xs">Loading guest reservations...</span>
            </div>
          ) : filteredHotelBookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary rounded-2xl space-y-2">
              <Users className="h-10 w-10 text-text-light mx-auto" />
              <h3 className="text-sm font-semibold text-text-primary">No Guest Bookings Found</h3>
              <p className="text-xs text-text-light">No room reservations match your search filter or have been placed yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-custom rounded-2xl bg-bg-primary">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-custom bg-bg-secondary/60 text-text-light uppercase tracking-wider text-[10px]">
                    <th className="p-4">Guest Name</th>
                    <th className="p-4">Hotel Property & Room</th>
                    <th className="p-4">Check-In / Out Dates</th>
                    <th className="p-4">Rooms</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50 text-text-primary">
                  {filteredHotelBookings.map((b: any) => {
                    const isConfirmed = b.bookingStatus === "CONFIRMED";
                    const isCancelled = b.bookingStatus === "CANCELLED";

                    return (
                      <tr key={b.id} className="hover:bg-bg-secondary/30 transition">
                        <td className="p-4">
                          <div className="font-semibold text-text-primary">{b.traveler?.fullName || "Guest"}</div>
                          <div className="text-[10px] text-text-light">{b.traveler?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-text-primary">{b.hotel?.name || "Hotel Property"}</div>
                          <div className="text-[10px] text-text-light">{b.room?.title || b.room?.type || "Standard Room"}</div>
                        </td>
                        <td className="p-4 font-semibold text-text-primary">
                          <div>In: {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : "N/A"}</div>
                          <div className="text-text-light">Out: {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : "N/A"}</div>
                        </td>
                        <td className="p-4 font-bold text-text-primary">
                          {b.roomQuantity || 1} Room(s)
                        </td>
                        <td className="p-4 font-bold text-text-primary">
                          BDT {b.totalAmount?.toLocaleString()}
                        </td>
                        <td className="p-4">
                          {isConfirmed && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Confirmed</span>
                            </span>
                          )}
                          {b.bookingStatus === "PENDING" && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Verification Pending</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                              <XCircle className="h-3 w-3" />
                              <span>Cancelled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 3 & 4: Create / Edit View */}
      {(view === "create" || view === "edit") && (
        <div className="space-y-6">
          <div className="border-b border-border-custom pb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">
                {view === "edit" ? "Edit Hotel Property" : "List Your Hotel Property"}
              </h1>
              <p className="text-sm text-text-light mt-1">
                Link and setup new property coordinates linked to your owner account.
              </p>
            </div>
            <button
              onClick={handleCancelClick}
              className="bg-bg-secondary border border-border-custom text-text-primary hover:bg-opacity-80 font-bold py-2.5 px-4 text-xs transition rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Properties</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="max-w-3xl border border-border-custom bg-bg-primary p-6 md:p-8 space-y-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border-custom pb-2">
              Configure Property Credentials
            </h3>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Hotel Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cox's Bazar Grand Palace Resort"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Property Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sea Beach Road, Cox's Bazar"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Property Description</label>
              <textarea
                placeholder="Write a brief overview of features, location premium, etc."
                value={hotelDesc}
                onChange={(e) => setHotelDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary h-24 rounded-xl resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Amenities (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Wi-Fi, Swimming Pool, Ocean View"
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Standard Check-In Time</label>
                <input
                  type="time"
                  required
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Standard Check-Out Time</label>
                <input
                  type="time"
                  required
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Hotel Cover Photo *</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  id="hotel-cover-upload"
                />
                <label
                  htmlFor="hotel-cover-upload"
                  className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-xl inline-block"
                >
                  {isUploadingCover ? "Uploading..." : "Select Cover Photo"}
                </label>
                {coverPhoto && (
                  <div className="relative group w-16 h-16">
                    <img
                      src={coverPhoto}
                      alt="Cover preview"
                      className="w-16 h-16 object-cover border border-border-custom rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverPhoto("")}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold p-0.5 rounded-full w-4.5 h-4.5 flex items-center justify-center cursor-pointer shadow-md transition"
                      title="Remove cover photo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Photos */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Gallery Photos (Optional)</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                  id="hotel-gallery-upload"
                />
                <label
                  htmlFor="hotel-gallery-upload"
                  className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-xl inline-block"
                >
                  {isUploadingGallery ? "Uploading..." : "Select Gallery Photos"}
                </label>
                {galleryPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {galleryPhotos.map((url, i) => (
                      <div key={i} className="relative group w-12 h-12">
                        <img
                          src={url}
                          alt="Gallery preview"
                          className="w-12 h-12 object-cover border border-border-custom rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setGalleryPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold p-0.5 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer shadow-md transition"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isCreatingHotel || isUpdatingHotel}
                className="flex-1 bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-xl text-xs cursor-pointer"
              >
                {(isCreatingHotel || isUpdatingHotel) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>{view === "edit" ? "Save Changes" : "Link Hotel Property"}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-6 py-3 border border-border-custom font-bold text-text-secondary hover:bg-bg-secondary transition text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
