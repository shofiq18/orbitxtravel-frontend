"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetHotelsQuery,
  useCreateHotelMutation,
} from "@/redux/api/hotel/hotelApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { Home, ShieldCheck, Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function HotelPropertyPage() {
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

  const [createHotel, { isLoading: isCreatingHotel }] = useCreateHotelMutation();
  const [uploadFile] = useUploadFileMutation();

  // Create Hotel Form States
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("Wi-Fi, Swimming Pool, Ocean View");

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

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !hotelAddress) {
      toast.error("Please fill in required fields.");
      return;
    }

    if (!coverPhoto) {
      toast.error("Hotel Cover photo is required.");
      return;
    }

    try {
      const response = await createHotel({
        name: hotelName,
        address: hotelAddress,
        description: hotelDesc,
        amenities: amenitiesText.split(",").map((a) => a.trim()),
        photos: [coverPhoto, ...galleryPhotos],
      }).unwrap();
      toast.success(response?.message || "Hotel property listed successfully!");
      refetchHotels();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create hotel property.");
    }
  };

  if (isLoadingHotels) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-primary">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading property profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-custom pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Property Overview</h1>
          <p className="text-sm text-text-light mt-1">Configure property settings and features linked to your profile.</p>
        </div>
        
        {activeHotel && (
          <div className="flex items-center space-x-2 bg-theme-secondary/10 border border-theme-secondary/20 px-4 py-2 text-xs font-bold text-theme-secondary rounded-none">
            <ShieldCheck className="h-4 w-4" />
            <span>Property Linked: {activeHotel.name}</span>
          </div>
        )}
      </div>

      {!activeHotel ? (
        <div className="max-w-2xl mx-auto border border-border-custom bg-bg-primary p-6 md:p-10 rounded-none space-y-6">
          <div className="text-center space-y-2">
            <Home className="h-10 w-10 text-theme-primary mx-auto" />
            <h3 className="text-xl font-bold text-text-primary">List Your Hotel Property</h3>
            <p className="text-sm text-text-secondary">
              You haven&#39;t linked a hotel property to your host profile yet. Let&#39;s start by setting up your property coordinates.
            </p>
          </div>

          <form onSubmit={handleCreateHotel} className="space-y-4">
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
                  <img
                    src={coverPhoto}
                    alt="Cover preview"
                    className="w-16 h-16 object-cover border border-border-custom animate-pulse"
                  />
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
                  <div className="flex flex-wrap gap-2 pt-2">
                    {galleryPhotos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Gallery preview"
                        className="w-12 h-12 object-cover border border-border-custom"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingHotel}
              className="w-full bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-90 transition rounded-none text-xs cursor-pointer"
            >
              {isCreatingHotel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Link Hotel Property</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="border border-border-custom bg-bg-primary p-6 space-y-6 rounded-none">
          <h3 className="text-lg font-bold text-text-primary border-b border-border-custom pb-2">
            Hotel Property Coordinates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
            <div>
              <span className="block font-bold text-text-primary text-[10px]">Property Name</span>
              <span className="text-base text-text-primary font-bold">{activeHotel.name}</span>
            </div>
            <div>
              <span className="block font-bold text-text-primary text-[10px]">Address</span>
              <span>{activeHotel.address}</span>
            </div>
          </div>

          <div>
            <span className="block font-bold text-text-primary text-[10px] mb-1">Description</span>
            <p className="text-sm text-text-secondary leading-relaxed bg-bg-secondary p-4 border border-border-custom font-medium rounded-none">
              {activeHotel.description || "No description provided."}
            </p>
          </div>

          <div>
            <span className="block font-bold text-text-primary text-[10px] mb-2">Amenities Linked</span>
            <div className="flex flex-wrap gap-2">
              {activeHotel.amenities.map((amenity: string, idx: number) => (
                <span key={idx} className="bg-bg-secondary border border-border-custom px-3 py-1 text-xs font-semibold text-text-primary rounded-none">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Photos Display */}
          {activeHotel.photos && activeHotel.photos.length > 0 && (
            <div className="space-y-3">
              <span className="block font-bold text-text-primary text-[10px]">Property Cover & Gallery</span>
              <div className="flex flex-wrap gap-3">
                {activeHotel.photos.map((photo: string, idx: number) => (
                  <div key={idx} className="relative w-24 h-24 border border-border-custom bg-bg-secondary overflow-hidden">
                    <img
                      src={photo}
                      alt={`Property Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
