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
import { useGetBookingsByUserQuery } from "@/redux/api/booking/bookingApi";
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
  ShieldCheck,
  Landmark,
  Send,
  Clock,
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  UserCheck,
  Eye,
  X
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

  // Dashboard view mode: "packages", "bookings", "create", "edit"
  const [view, setView] = useState<"packages" | "bookings" | "create" | "edit">("packages");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Selected package modal state (for clicking package -> viewing bookings)
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<any | null>(null);

  // Search filter for bookings
  const [bookingSearch, setBookingSearch] = useState("");

  // Advance payout request modal state
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceReason, setAdvanceReason] = useState("Advance deposit for bus reservation and hotel booking");

  // API Hooks
  const { data: packagesResponse, isLoading: isLoadingPackages, refetch: refetchPackages } = useGetPackagesQuery({
    organizerId: user?.id,
  });
  const myPackages = packagesResponse?.data || [];

  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookingsByUserQuery(undefined, {
    skip: !user || user.currentRole !== "tour_organizer",
  });
  const tourBookings = bookingsResponse?.data || [];

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

  const formatISODate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

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
    setView("packages");
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
    if (confirm("Are you sure you want to delete this tour package? This action is permanent.")) {
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
          toast.success(`Day ${index + 1} photo uploaded!`);
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
      toast.error("Failed to upload photos.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

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

  const handleSubmitAdvanceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Advance Payout Request submitted to Admin for review!");
    setShowAdvanceModal(false);
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
      setView("packages");
      refetchPackages();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process package.");
    }
  };

  const filteredTourBookings = tourBookings.filter((b: any) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    const pkgName = (b.package?.title || "").toLowerCase();
    const travelerName = (b.traveler?.fullName || "").toLowerCase();
    const travelerEmail = (b.traveler?.email || "").toLowerCase();
    const txn = (b.paymentTxnId || "").toLowerCase();
    return pkgName.includes(q) || travelerName.includes(q) || travelerEmail.includes(q) || txn.includes(q);
  });

  // Filtered bookings for the selected package modal
  const selectedPackageBookings = selectedPackageForModal
    ? tourBookings.filter((b: any) => b.packageId === selectedPackageForModal.id)
    : [];

  const totalSeatsBookedForModal = selectedPackageBookings.reduce((sum: number, b: any) => sum + (b.seatsBooked || 0), 0);
  const totalDepositCollectedForModal = selectedPackageBookings.reduce((sum: number, b: any) => sum + (b.paidAmount || 0), 0);

  if (!user || user.currentRole !== "tour_organizer") {
    return null;
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 min-h-[80vh] space-y-8">
      
      {/* Escrow Balance & Navigation Banner */}
      <div className="border border-border-custom bg-bg-primary p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Landmark className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-text-light uppercase tracking-wider block">ORBITX ESCROW FUNDS</span>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">Host Escrow Active</h3>
            <p className="text-xs text-text-light">Funds are protected and released automatically or on advance request.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowAdvanceModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition flex items-center space-x-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4" />
            <span>Request Advance (50%)</span>
          </button>
        </div>
      </div>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border-custom pb-3">
        <button
          onClick={() => setView("packages")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            view === "packages"
              ? "bg-theme-primary text-white"
              : "bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>My Tour Packages ({myPackages.length})</span>
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
          <span>All Bookings & Travelers ({tourBookings.length})</span>
        </button>
      </div>

      {/* View 1: Packages List View */}
      {view === "packages" && (
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
              className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-5 text-xs hover:bg-opacity-95 transition rounded-xl flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
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
            <div className="text-center py-20 border border-dashed border-border-custom bg-bg-primary rounded-2xl">
              <Compass className="h-12 w-12 text-text-light mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary">No Tours Launched Yet</h3>
              <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                Click &quot;Create Tour Package&quot; to list your first tour package for travelers!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPackages.map((pkg: any) => {
                const pkgBookings = tourBookings.filter((b: any) => b.packageId === pkg.id);
                const bookedCount = pkgBookings.reduce((sum: number, b: any) => sum + (b.seatsBooked || 0), 0);

                return (
                  <div key={pkg.id} className="border border-border-custom bg-bg-primary flex flex-col justify-between rounded-2xl overflow-hidden hover:shadow-md transition duration-300">
                    <div>
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

                      <div className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-text-primary text-base line-clamp-1">{pkg.title}</h3>
                          <p className="text-xs text-text-light font-semibold flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-text-light" />
                            <span>{pkg.destination}</span>
                          </p>
                        </div>

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

                        <div className="flex justify-between items-end bg-bg-secondary/40 p-3 border border-border-custom/50 rounded-xl">
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

                    {/* Actions footer with View Travelers button */}
                    <div className="p-4 border-t border-border-custom/40 bg-bg-secondary/20 space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPackageForModal(pkg)}
                        className="w-full bg-theme-primary hover:bg-opacity-95 text-white font-bold py-2 text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer rounded-xl shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Travelers ({pkgBookings.length} Booked)</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(pkg)}
                          className="flex-1 bg-bg-primary hover:bg-bg-secondary border border-border-custom text-text-primary font-bold py-1.5 text-xs transition flex items-center justify-center space-x-1 cursor-pointer rounded-xl"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pkg.id)}
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

      {/* Package Specific Bookings Drill-Down Modal */}
      {selectedPackageForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-custom max-w-3xl w-full rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border-custom pb-4">
              <div>
                <span className="text-[10px] font-bold text-theme-primary uppercase tracking-wider block">PACKAGE BOOKINGS DRILL-DOWN</span>
                <h3 className="text-lg font-bold text-text-primary">{selectedPackageForModal.title}</h3>
                <p className="text-xs text-text-light mt-0.5">
                  Destination: {selectedPackageForModal.destination} • Depart: {new Date(selectedPackageForModal.startDate).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackageForModal(null)}
                className="p-1.5 text-text-light hover:text-text-primary hover:bg-bg-secondary rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Package Summary Stats Bar */}
            <div className="grid grid-cols-3 gap-3 bg-bg-secondary/40 p-4 rounded-xl border border-border-custom/50 text-xs">
              <div>
                <span className="text-[10px] font-bold text-text-light uppercase block">Total Reservations</span>
                <span className="font-bold text-text-primary text-sm">{selectedPackageBookings.length} Booking(s)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-light uppercase block">Seats Reserved</span>
                <span className="font-bold text-theme-primary text-sm">{totalSeatsBookedForModal} / {selectedPackageForModal.maxSeats} Seats</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-light uppercase block">Escrow Deposits</span>
                <span className="font-extrabold text-[#e2136e] text-sm">BDT {totalDepositCollectedForModal.toLocaleString()}</span>
              </div>
            </div>

            {/* Travelers Table */}
            {selectedPackageBookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border-custom rounded-xl space-y-2">
                <Users className="h-8 w-8 text-text-light mx-auto" />
                <p className="text-xs font-semibold text-text-primary">No Travelers Booked Yet</p>
                <p className="text-[11px] text-text-light">Share your package link to receive seat reservations!</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border-custom rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-custom bg-bg-secondary/60 text-text-light uppercase tracking-wider text-[10px]">
                      <th className="p-3">Traveler Details</th>
                      <th className="p-3">Seats</th>
                      <th className="p-3">Deposit Paid</th>
                      <th className="p-3">bKash TrxID</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/50 text-text-primary">
                    {selectedPackageBookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-bg-secondary/30 transition">
                        <td className="p-3">
                          <div className="font-semibold text-text-primary">{b.traveler?.fullName || "Traveler"}</div>
                          <div className="text-[10px] text-text-light">{b.traveler?.email}</div>
                        </td>
                        <td className="p-3 font-bold text-text-primary">
                          {b.seatsBooked} Seat(s)
                        </td>
                        <td className="p-3 font-bold text-[#e2136e]">
                          BDT {b.paidAmount?.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-text-secondary">
                          {b.paymentTxnId || "N/A"}
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
                onClick={() => setSelectedPackageForModal(null)}
                className="px-4 py-2 bg-bg-secondary text-text-primary font-semibold text-xs rounded-xl hover:bg-opacity-80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Bookings & Travelers View */}
      {view === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">All Traveler Reservations</h1>
              <p className="text-xs text-text-light mt-1">View all travelers who have reserved seats across all your tour packages.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-light" />
              <input
                type="text"
                placeholder="Search package, traveler, or TrxID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary transition"
              />
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="flex items-center justify-center py-20 text-text-secondary space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-theme-primary" />
              <span className="text-xs">Loading traveler reservations...</span>
            </div>
          ) : filteredTourBookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border-custom bg-bg-primary rounded-2xl space-y-2">
              <Users className="h-10 w-10 text-text-light mx-auto" />
              <h3 className="text-sm font-semibold text-text-primary">No Bookings Found</h3>
              <p className="text-xs text-text-light">No travelers match your search filter or have reserved your tours yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-custom rounded-2xl bg-bg-primary">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-custom bg-bg-secondary/60 text-text-light uppercase tracking-wider text-[10px]">
                    <th className="p-4">Traveler Name</th>
                    <th className="p-4">Tour Package</th>
                    <th className="p-4">Reserved Seats</th>
                    <th className="p-4">Deposit Amount</th>
                    <th className="p-4">bKash Reference</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50 text-text-primary">
                  {filteredTourBookings.map((b: any) => {
                    const isConfirmed = b.bookingStatus === "CONFIRMED";
                    const isCancelled = b.bookingStatus === "CANCELLED";

                    return (
                      <tr key={b.id} className="hover:bg-bg-secondary/30 transition">
                        <td className="p-4">
                          <div className="font-semibold text-text-primary">{b.traveler?.fullName || "Traveler"}</div>
                          <div className="text-[10px] text-text-light">{b.traveler?.email}</div>
                        </td>
                        <td className="p-4 font-semibold text-text-primary">
                          {b.package?.title || "Tour Package"}
                        </td>
                        <td className="p-4 font-bold text-text-primary">
                          {b.seatsBooked} Seat(s)
                        </td>
                        <td className="p-4 font-bold text-[#e2136e]">
                          BDT {b.paidAmount?.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-text-secondary">
                          {b.paymentTxnId || "N/A"}
                        </td>
                        <td className="p-4">
                          {isConfirmed && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Confirmed & Escrow Locked</span>
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

      {/* Advance Request Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitAdvanceRequest} className="bg-bg-primary border border-border-custom p-6 max-w-md w-full rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-emerald-600" />
              <span>Request Advance Payout (Up to 50%)</span>
            </h3>
            <p className="text-xs text-text-light leading-relaxed">
              Submit an advance disbursal request to Admin to reserve transport, hotel rooms, or supplies prior to the tour departure date.
            </p>
            
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Reason / Expenses Description *</label>
              <textarea
                rows={3}
                required
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                placeholder="Describe why advance payout is required..."
                className="w-full p-3 text-xs border border-border-custom bg-bg-secondary text-text-primary rounded-xl outline-none focus:border-theme-primary"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanceModal(false)}
                className="px-4 py-2 border border-border-custom text-text-secondary text-xs font-bold rounded-xl hover:bg-bg-secondary transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit View */}
      {(view === "create" || view === "edit") && (
        <div className="space-y-6">
          <div className="border-b border-border-custom pb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-wide">
                {view === "edit" ? "Edit Tour Package" : "Tour Package Constructor"}
              </h1>
              <p className="text-sm text-text-light mt-1">
                Configure seat pricing, include transport/meal layouts, and launch custom travel tours.
              </p>
            </div>
            <button
              onClick={handleCancelClick}
              className="bg-bg-secondary border border-border-custom text-text-primary hover:bg-opacity-80 font-bold py-2.5 px-4 text-xs transition rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tours</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handlePublishPackage} className="lg:col-span-2 border border-border-custom bg-bg-primary p-6 md:p-8 space-y-6 rounded-2xl shadow-xs">
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={pkgEnd}
                    onChange={(e) => setPkgEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Seats Capacity *</label>
                  <input
                    type="number"
                    required
                    value={pkgSeats}
                    onChange={(e) => setPkgSeats(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl font-mono"
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
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Meal Arrangements</label>
                  <input
                    type="text"
                    value={mealText}
                    onChange={(e) => setMealText(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-xl"
                  />
                </div>
              </div>

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

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPublishing || isUpdating}
                  className="flex-1 bg-btn-primary text-btn-text-primary font-bold py-3 flex justify-center items-center space-x-2 hover:bg-opacity-95 transition rounded-xl text-xs cursor-pointer pt-3 shadow-sm"
                >
                  {(isPublishing || isUpdating) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-5 w-5" />}
                  <span>{view === "edit" ? "Save Changes" : "Launch Tour Package"}</span>
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

            <div className="border border-border-custom bg-bg-secondary/40 p-6 space-y-6 rounded-2xl h-fit">
              <h4 className="text-xs font-semibold text-text-primary border-b border-border-custom pb-2">
                Active B2B Room Holds
              </h4>
              
              <div className="p-3 bg-theme-primary/10 border border-theme-primary/20 text-xs text-text-secondary leading-normal rounded-xl space-y-1">
                <p className="font-bold text-theme-primary text-[10px]">Holds Expiry Lock</p>
                <p>Room holds expire automatically after **24 hours** if the package is not completed.</p>
              </div>

              {lockedRoomHolds.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-custom rounded-xl bg-bg-primary text-xs text-text-light font-bold">
                  No rooms linked yet. Go to &quot;Lock B2B Partner Rooms&quot; in the sidebar to reserve.
                </div>
              ) : (
                <div className="space-y-4">
                  {lockedRoomHolds.map((h, i) => (
                    <div key={i} className="border border-border-custom bg-bg-primary p-4 rounded-xl text-xs space-y-1 font-semibold text-text-secondary">
                      <p className="font-bold text-text-primary text-sm">{h.roomType}</p>
                      <p>Qty: <span className="font-bold text-text-primary">{h.quantity} Rooms</span></p>
                      <p>Dates: {h.checkInDate} &rarr; {h.checkOutDate}</p>
                    </div>
                  ))}
                  
                  {view === "create" && (
                    <button
                      type="button"
                      onClick={handleClearHolds}
                      className="w-full text-center text-xs font-bold text-red-600 border border-red-200 py-2 hover:bg-red-50 transition cursor-pointer rounded-xl"
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
