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
  ArrowLeft 
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

  // Dashboard view mode: "list", "create", "edit"
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);

  // API Hooks
  const { data: hotelsResponse, isLoading: isLoadingHotels, refetch: refetchHotels } = useGetHotelsQuery({
    ownerId: user?.id,
  });
  const myHotels = hotelsResponse?.data || [];

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
    setView("list");
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
    if (confirm("Are you sure you want to delete this hotel property? This action is permanent and will release all room configurations and bookings.")) {
      try {
        await deleteHotel(id).unwrap();
        toast.success("Hotel listed property deleted successfully!");
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
      toast.error("Failed to upload one or more gallery photos.");
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
        toast.success("Hotel listed property details updated successfully!");
      } else {
        await createHotel(payload).unwrap();
        toast.success("Hotel listed property created successfully!");
      }
      clearForm();
      setView("list");
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process hotel details.");
    }
  };

  if (!user || user.currentRole !== "hotel_owner") {
    return null;
  }

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      
      {/* View 1: List View */}
      {view === "list" && (
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
              className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-5 text-xs hover:bg-opacity-95 transition rounded-none flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
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
            <div className="max-w-2xl mx-auto border border-border-custom bg-bg-primary p-6 md:p-10 text-center rounded-none space-y-4">
              <Home className="h-10 w-10 text-theme-primary mx-auto" />
              <h3 className="text-xl font-semibold text-text-primary">List Your Hotel Property</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                You haven&apos;t linked any hotel properties to your host profile yet. Setup your first property listing to get started!
              </p>
              <button
                onClick={() => setView("create")}
                className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-6 text-xs hover:bg-opacity-90 transition rounded-none cursor-pointer"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myHotels.map((hotel: any) => (
                <div key={hotel.id} className="border border-border-custom bg-bg-primary flex flex-col justify-between rounded-none overflow-hidden hover:shadow-md transition duration-300">
                  <div>
                    {/* Cover Preview */}
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
                          <span className="bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-wide">
                            Verified
                          </span>
                        ) : (
                          <span className="bg-amber-600 text-white font-bold text-[9px] px-2.5 py-0.5 uppercase tracking-wide">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-text-primary text-lg line-clamp-1">{hotel.name}</h3>
                        <p className="text-xs text-text-light font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-text-light shrink-0" />
                          <span className="truncate">{hotel.address}</span>
                        </p>
                      </div>

                      {/* Detail Metrics */}
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

                      {/* Description */}
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                        {hotel.description || "No description provided."}
                      </p>

                      {/* Amenities Linked */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.slice(0, 4).map((amt: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-bg-secondary border border-border-custom/50 text-text-secondary px-2 py-0.5 rounded-none font-medium"
                            >
                              {amt}
                            </span>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <span className="text-[9px] text-text-light font-bold px-1 py-0.5">
                              +{hotel.amenities.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-6 border-t border-border-custom/40 bg-bg-secondary/20 flex gap-3">
                    <button
                      onClick={() => handleEditClick(hotel)}
                      className="flex-1 bg-bg-primary hover:bg-bg-secondary border border-border-custom text-text-primary font-bold py-2 text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer rounded-none"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Property</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(hotel.id)}
                      className="flex-1 bg-transparent hover:bg-red-50 hover:bg-opacity-40 border border-red-200 text-red-600 hover:text-red-700 font-bold py-2 text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer rounded-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: Create / Edit View */}
      {(view === "create" || view === "edit") && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-border-custom pb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">
                {view === "edit" ? "Edit Hotel Property" : "List Your Hotel Property"}
              </h1>
              <p className="text-sm text-text-light mt-1">
                {view === "edit" ? "Modify property description, amenities, and policy settings." : "Link and setup new property coordinates linked to your owner account."}
              </p>
            </div>
            <button
              onClick={handleCancelClick}
              className="bg-bg-secondary border border-border-custom text-text-primary hover:bg-opacity-80 font-bold py-2.5 px-4 text-xs transition rounded-none flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Properties</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="max-w-3xl border border-border-custom bg-bg-primary p-6 md:p-8 space-y-6 rounded-none">
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
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
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
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Property Description</label>
              <textarea
                placeholder="Write a brief overview of features, location premium, etc."
                value={hotelDesc}
                onChange={(e) => setHotelDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary h-24 rounded-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Amenities (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Wi-Fi, Swimming Pool, Ocean View"
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
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
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Standard Check-Out Time</label>
                <input
                  type="time"
                  required
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
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
                  className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-none inline-block"
                >
                  {isUploadingCover ? "Uploading..." : "Select Cover Photo"}
                </label>
                {coverPhoto && (
                  <div className="relative group w-16 h-16">
                    <img
                      src={coverPhoto}
                      alt="Cover preview"
                      className="w-16 h-16 object-cover border border-border-custom"
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
                  className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-none inline-block"
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
                          className="w-12 h-12 object-cover border border-border-custom"
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
                className="flex-1 bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-none text-xs cursor-pointer"
              >
                {(isCreatingHotel || isUpdatingHotel) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>{view === "edit" ? "Save Changes" : "Link Hotel Property"}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-6 py-3 border border-border-custom font-bold text-text-secondary hover:bg-bg-secondary transition text-xs rounded-none cursor-pointer"
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
