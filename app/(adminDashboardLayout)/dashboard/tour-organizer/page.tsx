"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  useGetPackagesQuery, 
  useCreatePackageMutation, 
  useUpdatePackageMutation, 
  useDeletePackageMutation 
} from "@/redux/api/tour/tourApi";
import { useUploadFileMutation } from "@/redux/api/auth/authApi";
import { 
  Compass, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  MapPin, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function TourConstructorPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Route protection - ensure user is tour organizer
  useEffect(() => {
    if (!user || user.currentRole !== "tour_organizer") {
      toast.error("Access Denied: Please log in as a Tour Organizer to view this portal.");
      router.push("/");
    }
  }, [user, router]);

  // Dashboard view mode: "list", "create", "edit"
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // API Hooks
  const { data: packagesResponse, isLoading: isLoadingPackages, refetch: refetchPackages } = useGetPackagesQuery({
    organizerId: user?.id,
  });
  const myPackages = packagesResponse?.data || [];

  const [createPackage, { isLoading: isPublishing }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();
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
  const [durationDays, setDurationDays] = useState("3");
  const [durationNights, setDurationNights] = useState("2");
  
  // Inclusions States
  const [transportText, setTransportText] = useState("AC Volvo Scania Bus");
  const [mealText, setMealText] = useState("Breakfast & Seafood Dinner");
  const [stayText, setStayText] = useState("");
  const [activitiesText, setActivitiesText] = useState("Beach Volleyball, Sunset Parasailing");

  const [coverPhoto, setCoverPhoto] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
 
  // Itinerary Planner States
  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string; image?: string }[]>([
    { day: 1, title: "", description: "", image: "" }
  ]);

  // Helper to format ISO dates to datetime-local format
  const formatISODate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  // Prefill helper when entering Edit mode
  const handleEditClick = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPkgTitle(pkg.title);
    setPkgDestination(pkg.destination);
    setPkgStart(formatISODate(pkg.startDate));
    setPkgEnd(formatISODate(pkg.endDate));
    setPkgSeats(pkg.maxSeats.toString());
    setPkgPrice(pkg.totalPackagePrice.toString());
    setLockFee(pkg.minimumSeatLockFee.toString());
    setTransportText(pkg.inclusions?.transport || "");
    setMealText(pkg.inclusions?.mealPlan || "");
    setStayText(pkg.inclusions?.stayType || "");
    setActivitiesText((pkg.inclusions?.customs || []).join(", "));
    setCoverPhoto(pkg.inclusions?.coverImage || "");
    setGalleryPhotos(pkg.inclusions?.photos || []);
    setDurationDays(pkg.inclusions?.durationDays?.toString() || "3");
    setDurationNights(pkg.inclusions?.durationNights?.toString() || "2");
    setItinerary(pkg.itinerary?.length > 0 
      ? pkg.itinerary.map((day: any) => ({ ...day, image: day.image || "" }))
      : [{ day: 1, title: "", description: "", image: "" }]
    );
    setView("edit");
  };

  const handleCancelClick = () => {
    setView("list");
    setEditingPackageId(null);
    clearForm();
  };

  const clearForm = () => {
    setPkgTitle("");
    setPkgDestination("");
    setPkgStart("");
    setPkgEnd("");
    setPkgSeats("15");
    setPkgPrice("");
    setLockFee("");
    setTransportText("AC Volvo Scania Bus");
    setMealText("Breakfast & Seafood Dinner");
    setStayText("");
    setActivitiesText("Beach Volleyball, Sunset Parasailing");
    setCoverPhoto("");
    setGalleryPhotos([]);
    setItinerary([{ day: 1, title: "", description: "", image: "" }]);
    setLockedRoomHolds([]);
    setDurationDays("3");
    setDurationNights("2");
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this tour package? This action is permanent and will release all room holds/bookings.")) {
      try {
        await deletePackage(id).unwrap();
        toast.success("Tour package deleted successfully!");
        refetchPackages();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete package.");
      }
    }
  };

  const handleAddItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { day: prev.length + 1, title: "", description: "", image: "" },
    ]);
  };
 
  const handleRemoveItineraryDay = (index: number) => {
    setItinerary((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((item, idx) => ({ ...item, day: idx + 1 }));
    });
  };
 
  const handleUpdateItineraryField = (index: number, field: "title" | "description" | "image", value: string) => {
    setItinerary((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };
 
  // Itinerary photo upload helper
  const [uploadingDayIdx, setUploadingDayIdx] = useState<number | null>(null);
 
  const handleDayPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDayIdx(index);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadFile({ file: reader.result as string }).unwrap();
        if (res?.success && res?.data) {
          handleUpdateItineraryField(index, "image", res.data);
          toast.success(`Day ${index + 1} photo uploaded successfully!`);
        }
      } catch (err: any) {
        toast.error("Failed to upload day photo.");
      } finally {
        setUploadingDayIdx(null);
      }
    };
    reader.readAsDataURL(file);
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
  }, [view]);

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
        durationDays: Number(durationDays),
        durationNights: Number(durationNights),
      },
      itinerary: itinerary.filter(day => day.title.trim() !== ""),
      lockedRooms: view === "create" ? lockedRoomHolds.map((h) => ({
        roomId: h.roomId,
        quantity: h.quantity,
        checkInDate: h.checkInDate,
        checkOutDate: h.checkOutDate,
      })) : undefined,
    };
 
    try {
      if (view === "edit" && editingPackageId) {
        await updatePackage({ id: editingPackageId, body: payload }).unwrap();
        toast.success("Tour package updated successfully!");
      } else {
        await createPackage(payload).unwrap();
        toast.success("Tour package launched successfully!");
        localStorage.removeItem("active_b2b_holds");
      }
      clearForm();
      setView("list");
      refetchPackages();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process package.");
    }
  };

  if (!user || user.currentRole !== "tour_organizer") {
    return null;
  }

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-10 min-h-[80vh] space-y-8">
      
      {/* View 1: List View */}
      {view === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-5 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">Tour Management</h1>
              <p className="text-sm text-text-light mt-1">Manage seat allocations, configure details, and view your launched tours.</p>
            </div>
            <button
              onClick={() => {
                clearForm();
                setView("create");
              }}
              className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-5 text-xs hover:bg-opacity-95 transition rounded-none flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Tour Package</span>
            </button>
          </div>

          {isLoadingPackages ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
            </div>
          ) : myPackages.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border-custom bg-bg-primary rounded-none">
              <Compass className="h-12 w-12 text-text-light mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary">No Tours Launched Yet</h3>
              <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                You haven&apos;t created any packages. Click &quot;Create Tour Package&quot; to list your first tour package!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPackages.map((pkg: any) => (
                <div key={pkg.id} className="border border-border-custom bg-bg-primary flex flex-col justify-between rounded-none overflow-hidden hover:shadow-md transition duration-300">
                  <div>
                    {/* Cover Preview */}
                    <div className="h-48 bg-bg-secondary relative border-b border-border-custom/50">
                      {pkg.inclusions?.coverImage ? (
                        <img
                          src={pkg.inclusions.coverImage}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-light text-xs font-semibold">
                          No Cover Image
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
                        {pkg.isVerified ? (
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
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-text-primary text-base line-clamp-1">{pkg.title}</h3>
                        <p className="text-xs text-text-light font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-text-light" />
                          <span>{pkg.destination}</span>
                        </p>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary border-t border-b border-border-custom/40 py-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-text-light font-bold block uppercase tracking-wider">Starts</span>
                          <span className="font-semibold flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{new Date(pkg.startDate).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-text-light font-bold block uppercase tracking-wider">Allocation</span>
                          <span className="font-semibold flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            <span>{pkg.availableSeats}/{pkg.maxSeats} Seats Left</span>
                          </span>
                        </div>
                      </div>

                      {/* Prices info */}
                      <div className="flex justify-between items-end bg-bg-secondary/40 p-3 border border-border-custom/50">
                        <div>
                          <span className="text-[9px] text-text-light font-bold block uppercase">B2C Price</span>
                          <span className="text-sm font-extrabold text-theme-secondary">BDT {pkg.totalPackagePrice.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-text-light font-bold block uppercase">Lock Fee</span>
                          <span className="text-sm font-extrabold text-text-primary">BDT {pkg.minimumSeatLockFee.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-5 border-t border-border-custom/40 bg-bg-secondary/20 flex gap-3">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="flex-1 bg-bg-primary hover:bg-bg-secondary border border-border-custom text-text-primary font-bold py-2 text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer rounded-none"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Package</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(pkg.id)}
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
          {/* Form Header */}
          <div className="border-b border-border-custom pb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">
                {view === "edit" ? "Edit Tour Package" : "Tour Package Constructor"}
              </h1>
              <p className="text-sm text-text-light mt-1">
                {view === "edit" ? "Modify your travel details, parameters, and pricing specifications." : "Configure seat pricing, include transport/meal layouts, and launch custom travel tours."}
              </p>
            </div>
            <button
              onClick={handleCancelClick}
              className="bg-bg-secondary border border-border-custom text-text-primary hover:bg-opacity-80 font-bold py-2.5 px-4 text-xs transition rounded-none flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tours</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column (Col 2) */}
            <form onSubmit={handlePublishPackage} className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 md:p-8 space-y-6 rounded-none">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-custom pb-2">
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
                  <label className="block text-xs font-bold text-text-secondary mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={pkgStart}
                    onChange={(e) => setPkgStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
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
                  <label className="block text-xs font-bold text-text-secondary mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Duration (Nights) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 2"
                    value={durationNights}
                    onChange={(e) => setDurationNights(e.target.value)}
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

              <h3 className="text-sm font-semibold text-text-primary border-b border-border-custom pt-4 pb-1">
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
                    placeholder={view === "edit" ? "Accommodation details locked" : "Lock a B2B room in dynamic menu to pre-fill"}
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
             
              {/* Itinerary Constructor Section */}
              <div className="border-t border-border-custom pt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border-custom pb-2">
                  <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Tour Itinerary Planner</h4>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="bg-theme-secondary text-white text-xs font-bold px-3 py-1.5 hover:bg-opacity-95 transition rounded-none cursor-pointer"
                  >
                    + Add Day
                  </button>
                </div>
             
                <div className="space-y-4">
                  {itinerary.map((item, idx) => (
                    <div key={idx} className="border border-border-custom p-4 bg-bg-secondary/40 space-y-3 rounded-none relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-theme-primary">Day {item.day}</span>
                        {itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
             
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary mb-1">Day Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Arrival in Paro & Hotel Transfer"
                            value={item.title}
                            onChange={(e) => handleUpdateItineraryField(idx, "title", e.target.value)}
                            className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-primary outline-none focus:border-theme-primary rounded-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary mb-1">Day Photo (Optional)</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDayPhotoUpload(idx, e)}
                              className="hidden"
                              id={`itinerary-day-upload-${idx}`}
                            />
                            <label
                              htmlFor={`itinerary-day-upload-${idx}`}
                              className="px-4 py-2 border border-border-custom text-xs font-bold text-text-primary bg-bg-primary hover:bg-bg-secondary cursor-pointer transition rounded-none text-center shrink-0 block"
                            >
                              {uploadingDayIdx === idx ? "Uploading..." : item.image ? "Change Photo" : "Upload Photo"}
                            </label>
                            {item.image && (
                              <div className="relative group w-10 h-10 shrink-0">
                                <img
                                  src={item.image}
                                  alt={`Preview Day ${item.day}`}
                                  className="w-10 h-10 object-cover border border-border-custom"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItineraryField(idx, "image", "")}
                                  className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold p-0.5 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-pointer shadow-sm transition"
                                  title="Remove photo"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
             
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Day Plan / Activities Description *</label>
                        <textarea
                          required
                          placeholder="e.g. Upon arrival, we will complete visa formalities and proceed to our hotel. In the evening we will visit the local market."
                          value={item.description}
                          onChange={(e) => handleUpdateItineraryField(idx, "description", e.target.value)}
                          className="w-full px-3 py-2 text-xs text-text-primary border border-border-custom bg-bg-primary outline-none focus:border-theme-primary h-20 rounded-none resize-none"
                        />
                      </div>
                    </div>
                  ))}
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
                    id="tour-gallery-upload"
                  />
                  <label
                    htmlFor="tour-gallery-upload"
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
                  disabled={isPublishing || isUpdating}
                  className="flex-1 bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-none text-xs cursor-pointer pt-3"
                >
                  {(isPublishing || isUpdating) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-5 w-5" />}
                  <span>{view === "edit" ? "Save Changes" : "Launch Tour Package"}</span>
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

            {/* Hold details Sidebar Column (Col 1) */}
            <div className="border border-border-custom bg-bg-secondary/40 p-6 space-y-6 rounded-none h-fit">
              <h4 className="text-xs font-semibold text-text-primary border-b border-border-custom pb-2">
                Active B2B Room Holds
              </h4>
              
              <div className="p-3 bg-theme-primary/10 border border-theme-primary/20 text-xs text-text-secondary leading-normal rounded-none space-y-1">
                <p className="font-bold text-theme-primary text-[10px]">Holds Expiry Lock</p>
                <p>Room holds expire automatically after **24 hours** if the package is not completed. Host partners will release rooms back to travelers inventory.</p>
              </div>

              {lockedRoomHolds.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-custom rounded-none bg-bg-primary text-xs text-text-light font-bold">
                  {view === "edit" ? "Holds are locked for this published tour." : "No rooms linked yet. Go to \"Lock B2B Partner Rooms\" in the sidebar to reserve."}
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
                  
                  {view === "create" && (
                    <button
                      type="button"
                      onClick={handleClearHolds}
                      className="w-full text-center text-xs font-bold text-red-600 border border-red-200 py-2 hover:bg-red-50 hover:bg-opacity-50 transition cursor-pointer rounded-none"
                    >
                      Clear holds
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
