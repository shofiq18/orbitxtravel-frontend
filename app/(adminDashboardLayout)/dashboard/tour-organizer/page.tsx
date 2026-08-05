"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCreatePackageMutation } from "@/redux/api/tour/tourApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { Compass, ClipboardCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function TourConstructorPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is tour organizer
  if (!user || user.currentRole !== "tour_organizer") {
    toast.error("Access Denied: Please log in as a Tour Organizer to view this portal.");
    router.push("/");
  }

  const [createPackage, { isLoading: isPublishing }] = useCreatePackageMutation();
  const [uploadFile] = useUploadFileMutation();

  // Active holds loaded from LocalStorage
  const [lockedRoomHolds, setLockedRoomHolds] = useState<
    { roomId: string; roomType: string; quantity: number; checkInDate: string; checkOutDate: string }[]
  >([]);

  // Package Constructor Form States
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgDestination, setPkgDestination] = useState("");
  const [pkgStart, setPkgStart] = useState("");
  const [pkgEnd, setPkgEnd] = useState("");
  const [pkgSeats, setPkgSeats] = useState("15");
  const [pkgPrice, setPkgPrice] = useState("");
  const [lockFee, setLockFee] = useState("");
  
  // Inclusions States
  const [transportText, setTransportText] = useState("AC Volvo Scania Bus");
  const [mealText, setMealText] = useState("Breakfast & Seafood Dinner");
  const [stayText, setStayText] = useState("");
  const [activitiesText, setActivitiesText] = useState("Beach Volleyball, Sunset Parasailing");

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

  // Load holds from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHolds = localStorage.getItem("active_b2b_holds");
      if (savedHolds) {
        try {
          const parsed = JSON.parse(savedHolds);
          setLockedRoomHolds(parsed);
          if (parsed.length > 0) {
            setStayText(`Reserved Partner Room: ${parsed[0].roomType}`);
          }
        } catch (e) {
          console.error("Failed to parse holds", e);
        }
      }
    }
  }, []);

  const handleClearHolds = () => {
    localStorage.removeItem("active_b2b_holds");
    setLockedRoomHolds([]);
    setStayText("");
    toast.success("Active B2B holds cleared.");
  };

  const handlePublishPackage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverPhoto) {
      toast.error("Tour Cover photo is required.");
      return;
    }

    const payload = {
      title: pkgTitle,
      destination: pkgDestination,
      startDate: new Date(pkgStart).toISOString(),
      endDate: new Date(pkgEnd).toISOString(),
      maxSeats: Number(pkgSeats),
      totalPackagePrice: Number(pkgPrice),
      minimumSeatLockFee: Number(lockFee),
      inclusions: {
        transport: transportText,
        stayType: stayText || "Included Luxury Hotel Accommodation",
        mealPlan: mealText,
        customs: activitiesText.split(",").map((a) => a.trim()),
        coverImage: coverPhoto,
        photos: galleryPhotos,
      },
      lockedRooms: lockedRoomHolds.map((h) => ({
        roomId: h.roomId,
        quantity: h.quantity,
        checkInDate: h.checkInDate,
        checkOutDate: h.checkOutDate,
      })),
    };

    try {
      await createPackage(payload).unwrap();
      toast.success("Tour package launched successfully!");
      localStorage.removeItem("active_b2b_holds");
      setPkgTitle("");
      setPkgDestination("");
      setPkgPrice("");
      setLockFee("");
      setLockedRoomHolds([]);
      setStayText("");
      setCoverPhoto("");
      setGalleryPhotos([]);
      router.push("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create tour package.");
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-10 min-h-[80vh] space-y-8">
      {/* Page Title */}
      <div className="border-b border-border-custom pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tour Package Constructor</h1>
        <p className="text-sm text-text-light mt-1">Configure seat pricing, include transport/meal layouts, and launch custom travel tours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column (Col 2) */}
        <form onSubmit={handlePublishPackage} className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 md:p-8 space-y-6 rounded-none">
          <h3 className="text-lg font-bold text-text-primary border-b border-border-custom pb-2">
            Configure Tour Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Tour Package Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Premium Cox's Bazar Winter Escapade"
                value={pkgTitle}
                onChange={(e) => setPkgTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Destination Target *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cox's Bazar"
                value={pkgDestination}
                onChange={(e) => setPkgDestination(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={pkgStart}
                onChange={(e) => setPkgStart(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">End Date *</label>
              <input
                type="date"
                required
                value={pkgEnd}
                onChange={(e) => setPkgEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Seats Capacity *</label>
              <input
                type="number"
                required
                value={pkgSeats}
                onChange={(e) => setPkgSeats(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">B2C Total Cost (per seat) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 15500"
                value={pkgPrice}
                onChange={(e) => setPkgPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Minimum Seat Lock Fee (Deposit) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 2500"
                value={lockFee}
                onChange={(e) => setLockFee(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-text-primary border-b border-border-custom pt-4 pb-1">
            Inclusions & Highlights Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Transport Details</label>
              <input
                type="text"
                value={transportText}
                onChange={(e) => setTransportText(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Meal Arrangements</label>
              <input
                type="text"
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Linked Accommodation (Prefilled)</label>
              <input
                type="text"
                disabled
                placeholder="Lock a B2B room in dynamic menu to pre-fill"
                value={stayText}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary/40 outline-none rounded-none italic font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Custom Activities (comma-separated)</label>
              <input
                type="text"
                value={activitiesText}
                onChange={(e) => setActivitiesText(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Tour Cover Photo *</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="tour-cover-upload"
              />
              <label
                htmlFor="tour-cover-upload"
                className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 cursor-pointer transition rounded-none inline-block"
              >
                {isUploadingCover ? "Uploading..." : "Select Cover Photo"}
              </label>
              {coverPhoto && (
                <img
                  src={coverPhoto}
                  alt="Cover preview"
                  className="w-16 h-16 object-cover border border-border-custom"
                />
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
                id="tour-gallery-upload"
              />
              <label
                htmlFor="tour-gallery-upload"
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
            disabled={isPublishing}
            className="w-full bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-none text-xs cursor-pointer pt-3"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-5 w-5" />}
            <span>Launch Tour Package</span>
          </button>
        </form>

        {/* Hold details Sidebar Column (Col 1) */}
        <div className="border border-border-custom bg-bg-secondary/40 p-6 space-y-6 rounded-none h-fit">
          <h4 className="text-xs font-bold text-text-primary border-b border-border-custom pb-2">
            Active B2B Room Holds
          </h4>
          
          <div className="p-3 bg-theme-primary/10 border border-theme-primary/20 text-xs text-text-secondary leading-normal rounded-none space-y-1">
            <p className="font-bold text-theme-primary text-[10px]">Holds Expiry Lock</p>
            <p>Room holds expire automatically after **24 hours** if the package is not completed. Host partners will release rooms back to travelers inventory.</p>
          </div>

          {lockedRoomHolds.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border-custom rounded-none bg-bg-primary text-xs text-text-light font-bold">
              No rooms linked yet. Go to &quot;Lock B2B Partner Rooms&quot; in the sidebar to reserve.
            </div>
          ) : (
            <div className="space-y-4">
              {lockedRoomHolds.map((h, i) => (
                <div key={i} className="border border-border-custom bg-bg-primary p-4 rounded-none text-xs space-y-1 font-semibold text-text-secondary">
                  <p className="font-bold text-text-primary text-sm">{h.roomType}</p>
                  <p>Qty: <span className="font-bold text-text-primary">{h.quantity} Rooms</span></p>
                  <p>Dates: {h.checkInDate} &rarr; {h.checkOutDate}</p>
                  <p className="text-[10px] text-theme-secondary">Hold Lock Active (24 Hours)</p>
                </div>
              ))}
              
              <button
                onClick={handleClearHolds}
                className="w-full text-center text-xs font-bold text-red-600 border border-red-200 py-2 hover:bg-red-50 hover:bg-opacity-50 transition cursor-pointer rounded-none"
              >
                Clear holds
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
