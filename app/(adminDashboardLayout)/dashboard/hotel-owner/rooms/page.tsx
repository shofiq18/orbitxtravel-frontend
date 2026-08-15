"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "@/redux/api/hotel/hotelApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { Bed, ShieldCheck, Loader2, Plus, Edit2, Trash2, X, Building, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function HotelRoomsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is hotel owner
  useEffect(() => {
    if (!user || user.currentRole !== "hotel_owner") {
      toast.error("Access Denied: Please log in as a Hotel Owner to view this portal.");
      router.push("/");
    }
  }, [user, router]);

  // API Hooks
  const { data: hotelsResponse, isLoading: isLoadingHotels, refetch: refetchHotels } = useGetHotelsQuery(
    { ownerId: user?.id },
    { skip: !user }
  );
  const myHotels = hotelsResponse?.data || [];

  // Dropdown state for selecting hotel
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  useEffect(() => {
    if (myHotels.length > 0 && !selectedHotelId) {
      setSelectedHotelId(myHotels[0].id);
    }
  }, [myHotels, selectedHotelId]);

  const activeHotel = myHotels.find((h: any) => h.id === selectedHotelId) || myHotels[0];

  const [createRoom, { isLoading: isCreatingRoom }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdatingRoom }] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [uploadFile] = useUploadFileMutation();

  // Editing state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Create Room Form States
  const [roomType, setRoomType] = useState("");
  const [roomB2C, setRoomB2C] = useState("");
  const [roomB2B, setRoomB2B] = useState("");
  const [inventory, setInventory] = useState("5");
  const [roomAmenities, setRoomAmenities] = useState("King Bed, AC, Mini Fridge");

  const [coverPhoto, setCoverPhoto] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

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

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotel) {
      toast.error("Please select or list a hotel property first.");
      return;
    }
    if (!roomType || !roomB2C || !roomB2B) {
      toast.error("Please fill in all room pricing metrics.");
      return;
    }

    if (!coverPhoto) {
      toast.error("Room Cover photo is required.");
      return;
    }

    try {
      const body = {
        type: roomType,
        amenities: roomAmenities.split(",").map((a) => a.trim()).filter(Boolean),
        inventory: Number(inventory),
        b2cPrice: Number(roomB2C),
        b2bPrice: Number(roomB2B),
        photos: [coverPhoto, ...galleryPhotos],
      };

      if (editingRoomId) {
        const response = await updateRoom({
          roomId: editingRoomId,
          body,
        }).unwrap();
        toast.success(response?.message || "Room type updated successfully!");
        setEditingRoomId(null);
      } else {
        const response = await createRoom({
          hotelId: activeHotel.id,
          body,
        }).unwrap();
        toast.success(response?.message || "Room type listed successfully!");
      }
      
      setRoomType("");
      setRoomB2C("");
      setRoomB2B("");
      setInventory("5");
      setRoomAmenities("King Bed, AC, Mini Fridge");
      setCoverPhoto("");
      setGalleryPhotos([]);
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit room details.");
    }
  };

  const handleStartEdit = (rm: any) => {
    setEditingRoomId(rm.id);
    setRoomType(rm.type);
    setRoomB2C(rm.b2cPrice.toString());
    setRoomB2B(rm.b2bPrice.toString());
    setInventory(rm.inventory.toString());
    setRoomAmenities(rm.amenities.join(", "));
    setCoverPhoto(rm.photos?.[0] || "");
    setGalleryPhotos(rm.photos?.slice(1) || []);
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setRoomType("");
    setRoomB2C("");
    setRoomB2B("");
    setInventory("5");
    setRoomAmenities("King Bed, AC, Mini Fridge");
    setCoverPhoto("");
    setGalleryPhotos([]);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room type? This action cannot be undone.")) return;
    try {
      const response = await deleteRoom(roomId).unwrap();
      toast.success(response?.message || "Room type deleted successfully.");
      if (editingRoomId === roomId) {
        handleCancelEdit();
      }
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete room.");
    }
  };

  if (isLoadingHotels) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-primary">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
          <span>Loading room workspace...</span>
        </div>
      </div>
    );
  }

  if (myHotels.length === 0 || !activeHotel) {
    return (
      <div className="w-full mx-auto px-8 lg:px-16 py-16 min-h-[80vh] text-center space-y-4 bg-bg-primary border border-dashed border-border-custom rounded-2xl my-10 max-w-2xl">
        <Building className="h-12 w-12 text-theme-primary mx-auto" />
        <h1 className="text-xl font-bold text-text-primary">No Property Listed Yet</h1>
        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
          You need to list your hotel property first before adding room categories and inventory rates.
        </p>
        <button
          onClick={() => router.push("/dashboard/hotel-owner")}
          className="mt-2 inline-flex items-center space-x-2 bg-theme-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-opacity-95 transition"
        >
          <span>List Hotel Property Now</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh] space-y-8">
      
      {/* Header & Property Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-custom pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Room Inventory Management</h1>
          <p className="text-xs text-text-light mt-1">Configure individual suite types, rates, and B2B wholesale locks.</p>
        </div>
        
        {/* Hotel Property Dropdown Selection */}
        <div className="flex items-center space-x-3 bg-bg-secondary p-2 rounded-xl border border-border-custom w-full md:w-auto">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 ml-1" />
          <div className="w-full">
            <span className="text-[10px] font-bold text-text-light uppercase tracking-wider block">Selected Property</span>
            <select
              value={selectedHotelId || activeHotel.id}
              onChange={(e) => {
                setSelectedHotelId(e.target.value);
                handleCancelEdit();
              }}
              className="bg-transparent font-bold text-xs text-text-primary outline-none cursor-pointer w-full pr-2"
            >
              {myHotels.map((h: any) => (
                <option key={h.id} value={h.id} className="bg-bg-primary text-text-primary">
                  {h.name} ({h.address})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Room Creation / Edit Form */}
        <form onSubmit={handleSubmitRoom} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-2xl h-fit shadow-xs">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            {editingRoomId ? "Edit Room Category" : `Add Room Category for ${activeHotel.name}`}
          </h3>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Room Type Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deluxe Couple Suite Ocean View"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Total Inventory Count *</label>
            <input
              type="number"
              required
              min="1"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">B2C Public Rate (BDT/Night) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 6500"
                value={roomB2C}
                onChange={(e) => setRoomB2C(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">B2B Wholesale Rate (BDT) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 4800"
                value={roomB2B}
                onChange={(e) => setRoomB2B(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Room Amenities (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. King Bed, Air Conditioning, Balcony"
              value={roomAmenities}
              onChange={(e) => setRoomAmenities(e.target.value)}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
            />
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Room Cover Photo *</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="room-cover-upload"
              />
              <label
                htmlFor="room-cover-upload"
                className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-xl inline-block"
              >
                {isUploadingCover ? "Uploading..." : "Select Cover Photo"}
              </label>
              {coverPhoto && (
                <div className="relative group w-14 h-14">
                  <img
                    src={coverPhoto}
                    alt="Cover preview"
                    className="w-14 h-14 object-cover border border-border-custom rounded-xl"
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
            <label className="block text-xs font-bold text-text-secondary mb-1">Gallery Photos (Optional)</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                id="room-gallery-upload"
              />
              <label
                htmlFor="room-gallery-upload"
                className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-xl inline-block"
              >
                {isUploadingGallery ? "Uploading..." : "Select Gallery Photos"}
              </label>
              {galleryPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {galleryPhotos.map((url, i) => (
                    <div key={i} className="relative group w-11 h-11">
                      <img
                        src={url}
                        alt="Gallery preview"
                        className="w-11 h-11 object-cover border border-border-custom rounded-xl"
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

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isCreatingRoom || isUpdatingRoom}
              className="w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-xl text-xs cursor-pointer"
            >
              {isCreatingRoom || isUpdatingRoom ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingRoomId ? (
                <Edit2 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{editingRoomId ? "Update Room Type" : "Add Room Category"}</span>
            </button>
            {editingRoomId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full border border-border-custom text-text-primary font-bold py-2 flex justify-center items-center space-x-2 hover:bg-bg-secondary transition rounded-xl text-xs cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>
        </form>

        {/* Existing Rooms List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary tracking-wide">
              Listed Room Categories for &quot;{activeHotel.name}&quot;
            </h3>
            <span className="text-xs font-bold text-text-light">
              {activeHotel.rooms?.length || 0} Categories
            </span>
          </div>
          
          {(!activeHotel.rooms || activeHotel.rooms.length === 0) ? (
            <div className="text-center py-12 border border-dashed border-border-custom bg-bg-primary rounded-2xl">
              <Bed className="h-10 w-10 text-text-light mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-bold">No room categories listed yet for {activeHotel.name}.</p>
              <p className="text-[11px] text-text-light mt-1">Use the form on the left to add suite categories and set B2C / B2B rates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeHotel.rooms.map((rm: any) => (
                <div key={rm.id} className="border border-border-custom bg-bg-primary p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl shadow-xs hover:shadow-sm transition">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-text-primary text-base">{rm.type}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {rm.amenities.map((am: string, i: number) => (
                        <span key={i} className="bg-bg-secondary border border-border-custom/60 px-2 py-0.5 text-[10px] text-text-secondary font-semibold rounded-lg">
                          {am}
                        </span>
                      ))}
                    </div>

                    {/* Room Photos Display */}
                    {rm.photos && rm.photos.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {rm.photos.map((photo: string, idx: number) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Room Photo ${idx + 1}`}
                            className="w-10 h-10 object-cover border border-border-custom rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-5 text-right shrink-0">
                    <div>
                      <p className="text-[10px] text-text-light font-bold uppercase">B2C Public</p>
                      <p className="text-sm font-extrabold text-text-primary">BDT {rm.b2cPrice?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-light font-bold uppercase">B2B Wholesale</p>
                      <p className="text-sm font-extrabold text-theme-secondary">BDT {rm.b2bPrice?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-light font-bold uppercase">Inventory</p>
                      <p className="text-sm font-black text-theme-primary">{rm.inventory} Rooms</p>
                    </div>
                    <div className="flex items-center space-x-2 pl-4 border-l border-border-custom">
                      <button
                        onClick={() => handleStartEdit(rm)}
                        className={`p-2 transition rounded-xl border border-border-custom hover:bg-bg-secondary cursor-pointer ${
                          editingRoomId === rm.id
                            ? "bg-theme-primary/10 text-theme-primary border-theme-primary"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                        title="Edit Room Type"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(rm.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition rounded-xl border border-border-custom hover:border-red-200 cursor-pointer"
                        title="Delete Room Type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
