"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "@/redux/api/hotel/hotelApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { Bed, ShieldCheck, Loader2, Plus, Edit2, Trash2, X } from "lucide-react";
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
      toast.error("Failed to upload one or more gallery photos.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotel) return;
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
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading room workspace...</span>
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
          <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Room Inventory Management</h1>
          <p className="text-sm text-text-light mt-1">Configure individual suite types, rates, and B2B pricing locks.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-theme-secondary/10 border border-theme-secondary/20 px-4 py-2 text-xs font-bold text-theme-secondary rounded-none">
          <ShieldCheck className="h-4 w-4" />
          <span>Property Linked: {activeHotel.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <form onSubmit={handleSubmitRoom} className="border border-border-custom bg-bg-primary p-6 space-y-4 rounded-none h-fit">
          <h3 className="text-base font-semibold text-text-primary tracking-wide border-b border-border-custom pb-2">
            {editingRoomId ? "Edit Room Type" : "List a New Room Type"}
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
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold p-0.5 rounded-full w-4.5 h-4.5 flex items-center justify-center cursor-pointer shadow-md transition"
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

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isCreatingRoom || isUpdatingRoom}
              className="w-full bg-btn-primary text-btn-text-primary font-bold py-2.5 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer pt-3"
            >
              {isCreatingRoom || isUpdatingRoom ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingRoomId ? (
                <Edit2 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{editingRoomId ? "Update Room Type" : "Add Room Type"}</span>
            </button>
            {editingRoomId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full border border-border-custom text-text-primary font-bold py-2 flex justify-center items-center space-x-2 hover:bg-bg-secondary transition rounded-none text-xs cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>
        </form>

        {/* Existing Rooms list (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold text-text-primary tracking-wide">Existing Room Types</h3>
          
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
                    <h4 className="font-semibold text-text-primary text-sm">{rm.type}</h4>
                    <p className="text-[10px] text-text-light font-bold">ID: <span className="font-mono">{rm.id}</span></p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rm.amenities.map((am: string, i: number) => (
                        <span key={i} className="bg-bg-secondary border border-border-custom px-2 py-0.5 text-[10px] text-text-secondary rounded-none">
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
                            className="w-10 h-10 object-cover border border-border-custom"
                          />
                        ))}
                      </div>
                    )}
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
                    <div className="flex items-center space-x-2.5 pl-4 border-l border-border-custom">
                      <button
                        onClick={() => handleStartEdit(rm)}
                        className={`p-2 transition rounded-none border border-border-custom hover:bg-bg-secondary cursor-pointer ${
                          editingRoomId === rm.id
                            ? "bg-theme-primary/10 text-theme-primary border-theme-primary"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                        title="Edit Room Type"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(rm.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition rounded-none border border-border-custom hover:border-red-200 cursor-pointer"
                        title="Delete Room Type"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
