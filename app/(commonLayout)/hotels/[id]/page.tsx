'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetHotelByIdQuery, useGetReviewsQuery, useCreateReviewMutation, useGetRoomAvailabilityQuery } from "@/redux/api/hotel/hotelApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  Hotel as HotelIcon, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Bed, 
  Check, 
  Info, 
  Share, 
  Heart, 
  Globe,
  Star,
  Wifi,
  Tv,
  Car,
  Snowflake,
  Laptop,
  Utensils,
  Waves,
  Camera,
  Sparkles,
  MessageSquare,
  Key,
  Compass,
  Tag
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function HotelDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: hotelResponse, isLoading, error } = useGetHotelByIdQuery(id);
  const hotel = hotelResponse?.data;

  const { user } = useSelector((state: RootState) => state.user);
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingDays, setBookingDays] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Date selection states
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Guest count states
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  // Amenity expansion state
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Lightbox Zoom Modal States
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  // Dynamic reviews hooks
  const { data: reviewsResponse } = useGetReviewsQuery(id);
  const reviews = reviewsResponse?.data || [];
  const [createReviewApi, { isLoading: isPostingReview }] = useCreateReviewMutation();

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  // Review expansion and modal states
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // Selected details modal state
  const [selectedDetailRoom, setSelectedDetailRoom] = useState<any | null>(null);
  
  // Selected booking quantity state
  const [roomQuantity, setRoomQuantity] = useState(1);

  useEffect(() => {
    setRoomQuantity(1);
  }, [selectedRoom]);

  // Query live stays availability from database
  const { data: availabilityResponse } = useGetRoomAvailabilityQuery(
    {
      roomId: selectedRoom?.id || "",
      checkIn: checkInDate,
      checkOut: checkOutDate,
    },
    {
      skip: !selectedRoom?.id || !checkInDate || !checkOutDate,
    }
  );
  
  const remainingAvailableRooms = availabilityResponse?.data?.remainingInventory ?? (selectedRoom?.inventory ?? 0);

  // Helper to format review comments to sentence case if screaming uppercase
  const formatCommentText = (text: string) => {
    if (!text) return "";
    let formatted = text === text.toUpperCase() ? text.toLowerCase() : text;
    // Capitalize first letter of each sentence
    return formatted.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  };

  // Helper to parse max guest capacity from room type
  const getRoomMaxCapacity = (roomType: string) => {
    const type = roomType?.toLowerCase() || "";
    if (type.includes("single")) return 1;
    if (type.includes("couple") || type.includes("double")) return 2;
    if (type.includes("triple")) return 3;
    if (type.includes("quad") || type.includes("family") || type.includes("suite")) return 4;
    return 4; // Standard default limit
  };

  const currentMaxCapacity = getRoomMaxCapacity(selectedRoom?.type || hotel?.rooms?.[0]?.type || "");

  // Initialize selected room
  useEffect(() => {
    if (hotel?.rooms?.[0] && !selectedRoom) {
      setSelectedRoom(hotel.rooms[0]);
    }
  }, [hotel, selectedRoom]);

  // Adjust guest count if selected room changes and capacity is smaller
  useEffect(() => {
    if (selectedRoom) {
      const maxCap = getRoomMaxCapacity(selectedRoom.type);
      if (adults + children > maxCap) {
        setAdults(maxCap);
        setChildren(0);
        toast.success(`Guest count automatically adjusted to match ${selectedRoom.type} capacity (${maxCap} guest max).`);
      }
    }
  }, [selectedRoom]);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 0;
  };

  const nights = calculateNights();

  const handleConfirmLock = () => {
    const targetRoom = selectedRoom || hotel?.rooms?.[0];
    if (!targetRoom) {
      toast.error("No room category selected.");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      toast.error("Please pick check-in and checkout dates.");
      return;
    }
    if (!user) {
      toast.error("Please log in to initiate stay booking.");
      router.push(`/login?redirect=/hotels/${id}`);
      return;
    }
    router.push(`/checkout/hotel?hotelId=${id}&roomId=${targetRoom.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&adults=${adults}&children=${children}&infants=${infants}&quantity=${roomQuantity}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("Please log in to submit a review.");
      router.push(`/login?redirect=/hotels/${id}`);
      return;
    }

    try {
      await createReviewApi({
        hotelId: id,
        rating: newRating,
        comment: newComment.trim()
      }).unwrap();
      toast.success("Review submitted successfully! Thank you.");
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review.");
    }
  };

  // Helper to map amenity text to contextual Lucide icons
  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi") || n.includes("wi-fi") || n.includes("internet")) return Wifi;
    if (n.includes("kitchen") || n.includes("cook") || n.includes("dine")) return Utensils;
    if (n.includes("workspace") || n.includes("desk") || n.includes("laptop")) return Laptop;
    if (n.includes("pool") || n.includes("swim") || n.includes("infinity")) return Waves;
    if (n.includes("parking") || n.includes("garage") || n.includes("car")) return Car;
    if (n.includes("tv") || n.includes("television") || n.includes("netflix")) return Tv;
    if (n.includes("air cond") || n.includes("ac") || n.includes("cooling") || n.includes("heater")) return Snowflake;
    if (n.includes("camera") || n.includes("security") || n.includes("cctv")) return Camera;
    return Check;
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Retrieving property inventory...</span>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center px-4 space-y-4">
        <ShieldCheck className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold text-text-primary">Hotel Not Found</h3>
        <p className="text-sm text-text-secondary">
          The requested hotel listing or inventory could not be loaded.
        </p>
        <Link href="/hotels" className="bg-btn-primary text-btn-text-primary px-6 py-2 text-xs font-bold rounded-none">
          Back to Hotels
        </Link>
      </div>
    );
  }

  const isTourOrganizer = user?.currentRole === "tour_organizer" || user?.currentRole === "admin";

  // User actual photos arrays with empty placeholders fallback
  const defaultImages = [
    hotel.photos?.[0] || "",
    hotel.photos?.[1] || "",
    hotel.photos?.[2] || "",
    hotel.photos?.[3] || "",
    hotel.photos?.[4] || "",
  ];

  const allPhotos = defaultImages.filter(Boolean);

  const totalGuests = adults + children;
  const guestText = `${totalGuests} guest${totalGuests > 1 ? "s" : ""}` + 
    (infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : "");

  // Calculate average rating dynamically
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / reviews.length).toFixed(2)
    : "5.00";

  // Amenities display limits
  const visibleAmenities = showAllAmenities 
    ? hotel.amenities 
    : (hotel.amenities?.slice(0, 8) || []);

  return (
    <div className="w-full mx-auto px-8 lg:px-16 pt-3 pb-10 details-page-wrapper">
      


      {/* Simplified Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-custom pb-4 mb-2 mt-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-wide leading-tight">{hotel.name}</h1>
        
        {/* Right Action buttons */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary shrink-0">
          <button 
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 hover:bg-bg-secondary hover:text-text-primary py-1.5 px-3 bg-transparent transition rounded-none font-bold cursor-pointer text-xs"
          >
            <Share className="h-3.5 w-3.5 text-text-light" />
            <span>Share</span>
          </button>
          <button 
            onClick={() => toast.success("Property saved to favorites!")}
            className="flex items-center gap-1.5 hover:bg-bg-secondary hover:text-text-primary py-1.5 px-3 bg-transparent transition rounded-none font-bold cursor-pointer text-xs"
          >
            <Heart className="h-3.5 w-3.5 text-red-500" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Airbnb style 5-Photo Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-[400px] md:h-[550px] overflow-hidden rounded-none border border-border-custom relative bg-bg-secondary mt-1.5 mb-8">
        
        {/* Main Cover Image */}
        <div className="md:col-span-2 md:row-span-2 overflow-hidden cursor-zoom-in relative">
          {defaultImages[0] ? (
            <img
              src={defaultImages[0]}
              alt={`${hotel.name} - Cover`}
              onClick={() => setActivePhotoIdx(0)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-xs font-semibold">
              No Cover Photo Available
            </div>
          )}
        </div>

        {/* Top Middle Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[1] ? (
            <img
              src={defaultImages[1]}
              alt={`${hotel.name} - Room 1`}
              onClick={() => setActivePhotoIdx(1)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Top Right Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[2] ? (
            <img
              src={defaultImages[2]}
              alt={`${hotel.name} - Detail 2`}
              onClick={() => setActivePhotoIdx(2)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Bottom Middle Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block">
          {defaultImages[3] ? (
            <img
              src={defaultImages[3]}
              alt={`${hotel.name} - View 3`}
              onClick={() => setActivePhotoIdx(3)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
        </div>

        {/* Bottom Right Box */}
        <div className="overflow-hidden cursor-zoom-in relative hidden md:block group">
          {defaultImages[4] ? (
            <img
              src={defaultImages[4]}
              alt={`${hotel.name} - Interior 4`}
              onClick={() => setActivePhotoIdx(4)}
              className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center border border-border-custom/30 text-text-light text-[10px] font-semibold">
              Photo Coming Soon
            </div>
          )}
          {defaultImages[0] && (
            <button
              onClick={() => setActivePhotoIdx(0)}
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-black font-semibold text-xs py-2 px-3 shadow-md hover:scale-105 transition-all duration-300 rounded-none flex items-center gap-1.5 border border-gray-300 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Show all photos</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Host, Details, Amenities, Sleep areas, Rooms & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Host Header Line */}
          <div className="flex items-center justify-between border-b border-border-custom pb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Entire stay hosted by {hotel.owner?.fullName || "OrbitX Partner"}
              </h2>
              <p className="text-sm text-text-light mt-1">
                {hotel.rooms?.length || 0} Room Categories · {hotel.rooms?.[0]?.type || "Standard"} available
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="py-2 border-b border-border-custom space-y-6">
            <div className="flex items-start space-x-4">
              <ShieldCheck className="h-6 w-6 text-theme-secondary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">Verified Partnership Stay</h4>
                <p className="text-xs text-text-light mt-0.5">This property undergoes strict safety and quality compliance audit.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Bed className="h-6 w-6 text-theme-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">Flexible Room Inventory</h4>
                <p className="text-xs text-text-light mt-0.5">Select from multiple standard and partner-rate layouts matching your group count.</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">About the Hotel</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {hotel.description || "Welcome to our premium hotel listing, offering guests comfortable accommodations, professional hospitality services, and a perfect central base to enjoy local tourism, sightseeing, and relaxation."}
            </p>
          </div>

          {/* Contextual Amenities Grid ("What this place offers") */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="border-t border-border-custom pt-6 space-y-5">
              <h3 className="text-lg font-semibold text-text-primary">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleAmenities.map((amt: string, idx: number) => {
                  const IconComponent = getAmenityIcon(amt);
                  return (
                    <div key={idx} className="flex items-center space-x-3 text-sm text-text-secondary font-semibold py-1">
                      <IconComponent className="h-5 w-5 text-text-light shrink-0" />
                      <span>{amt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Show All Amenities Button */}
              {hotel.amenities.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-2 bg-bg-secondary border border-border-custom text-text-primary hover:bg-opacity-80 px-5 py-2.5 text-xs font-bold transition rounded-none cursor-pointer flex items-center justify-center"
                >
                  {showAllAmenities ? "Show Less" : `Show all ${hotel.amenities.length} amenities`}
                </button>
              )}
            </div>
          )}



          {/* Rooms Inventory */}
          <div className="border-t border-border-custom pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Available Room Options</h3>
            {(!hotel.rooms || hotel.rooms.length === 0) ? (
              <p className="text-sm text-text-light">No room rates currently configured. Check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {hotel.rooms.map((room: any) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedDetailRoom(room)}
                    className="border border-border-custom bg-bg-primary flex flex-col justify-between rounded-none transition hover:border-text-light cursor-pointer group hover:shadow-md duration-300"
                  >
                    <div>
                      {/* Room Photo Header */}
                      <div className="h-44 w-full bg-bg-secondary overflow-hidden relative border-b border-border-custom/50">
                        {room.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={room.photos[0]}
                            alt={room.type}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-text-light text-[10px] space-y-1">
                            <Bed className="h-6 w-6 text-text-light/50" />
                            <span>Room Photo Coming Soon</span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-text-primary/80 text-white font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide">
                          {room.inventory} Available
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-text-primary text-sm line-clamp-1">{room.type}</h4>
                          <p className="text-[10px] text-text-light font-bold">Standard Capacity: 2 Adults</p>
                        </div>

                        {/* Room Specific Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {room.amenities.slice(0, 3).map((amt: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[9px] bg-bg-secondary border border-border-custom/50 text-text-secondary px-2 py-0.5 rounded-none font-medium"
                              >
                                {amt}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="text-[9px] text-text-light font-bold px-1 py-0.5">
                                +{room.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Select and Pricing */}
                    <div className="p-4 border-t border-border-custom/40 space-y-3 bg-bg-secondary/20">
                      <div>
                        <p className="text-[9px] text-text-light font-bold uppercase">Public Rate</p>
                        <p className="text-base font-extrabold text-theme-secondary">
                          BDT {room.b2cPrice.toLocaleString()} <span className="text-[10px] font-semibold text-text-light">/ night</span>
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          toast.success(`${room.type} selected in the reservation checkout panel!`);
                          window.scrollTo({ top: 450, behavior: "smooth" });
                        }}
                        className="w-full bg-btn-primary text-btn-text-primary font-bold py-2 text-xs hover:bg-opacity-95 transition rounded-none cursor-pointer text-center"
                      >
                        Select Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

                    {/* Guest Reviews Option Section */}
          <div className="border-t border-border-custom pt-8 space-y-8">
            
            {/* Airbnb Laurel Laurel header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center space-x-5 select-none">
                {/* Left Laurel leaf branch */}
                <svg className="h-10 w-8 text-text-primary opacity-80" viewBox="0 0 24 32" fill="currentColor">
                  <path d="M12,4 C8,8 4,14 4,20 C4,24 7,28 12,28 C10,24 9,20 9,16 C9,12 10.5,8 12,4 Z" />
                  <path d="M12,10 C14,14 16,18 16,22 C16,25 14,27 12,27 C13,24 13.5,21 13.5,18 C13.5,15 13,12 12,10 Z" />
                </svg>
                <span className="text-6xl font-extrabold text-text-primary tracking-tighter leading-none">
                  {averageRating}
                </span>
                {/* Right Laurel leaf branch (mirrored) */}
                <svg className="h-10 w-8 text-text-primary opacity-80 scale-x-[-1] transform" viewBox="0 0 24 32" fill="currentColor">
                  <path d="M12,4 C8,8 4,14 4,20 C4,24 7,28 12,28 C10,24 9,20 9,16 C9,12 10.5,8 12,4 Z" />
                  <path d="M12,10 C14,14 16,18 16,22 C16,25 14,27 12,27 C13,24 13.5,21 13.5,18 C13.5,15 13,12 12,10 Z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-primary tracking-wide">Guest favorite</h3>
                <p className="text-xs text-text-light max-w-xs leading-relaxed mx-auto font-medium">
                  This property is a guest favorite based on ratings, reviews, and reliability.
                </p>
              </div>
            </div>

            {/* 7-Column Rating Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-8 gap-6 border-y border-border-custom py-8 text-xs font-semibold text-text-secondary">
              
              {/* Column 1: Overall rating distribution bars */}
              <div className="col-span-2 space-y-1.5 border-r border-border-custom/50 pr-4">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Overall rating</p>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const totalCount = reviews.length || 1;
                  const starCount = reviews.filter((r: any) => r.rating === stars).length;
                  const percentage = Math.min(100, Math.round((starCount / totalCount) * 100)) || (stars === 5 ? 100 : 0);
                  return (
                    <div key={stars} className="flex items-center space-x-2">
                      <span className="w-3 text-right">{stars}</span>
                      <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Cleanliness */}
              <div className="flex flex-col items-center justify-between py-1 text-center">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Cleanliness</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.min(5.0, Number(averageRating) + 0.02).toFixed(1)}
                </span>
                <Sparkles className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

              {/* Column 3: Accuracy */}
              <div className="flex flex-col items-center justify-between py-1 text-center border-l border-border-custom/30">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Accuracy</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.max(1.0, Number(averageRating) - 0.01).toFixed(1)}
                </span>
                <Check className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

              {/* Column 4: Check-in */}
              <div className="flex flex-col items-center justify-between py-1 text-center border-l border-border-custom/30">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Check-in</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.min(5.0, Number(averageRating) + 0.01).toFixed(1)}
                </span>
                <Key className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

              {/* Column 5: Communication */}
              <div className="flex flex-col items-center justify-between py-1 text-center border-l border-border-custom/30">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Communication</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.min(5.0, Number(averageRating) + 0.02).toFixed(1)}
                </span>
                <MessageSquare className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

              {/* Column 6: Location */}
              <div className="flex flex-col items-center justify-between py-1 text-center border-l border-border-custom/30">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Location</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.max(1.0, Number(averageRating) - 0.03).toFixed(1)}
                </span>
                <Compass className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

              {/* Column 7: Value */}
              <div className="flex flex-col items-center justify-between py-1 text-center border-l border-border-custom/30">
                <span className="text-[11px] text-[13px] text-text-primary font-extrabold">Value</span>
                <span className="text-lg font-black text-text-primary mt-1">
                  {Math.min(5.0, Number(averageRating) + 0.01).toFixed(1)}
                </span>
                <Tag className="h-5 w-5 text-text-light shrink-0 mt-3" />
              </div>

            </div>

            {/* 2-Column Reviews List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-4">
              {reviews.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-text-light text-xs font-semibold">
                  No guest feedback yet. Leave the first review below!
                </div>
              ) : (
                reviews.slice(0, 6).map((rev: any, idx: number) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-base border border-theme-primary/20 shrink-0">
                        {rev.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary capitalize">{rev.name}</h4>
                        <p className="text-[10px] text-text-light font-semibold">Verified Traveler &middot; OrbitX Member</p>
                      </div>
                    </div>
                    
                    {/* Stars and Date Line */}
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="flex space-x-0.5 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                        {[...Array(Math.max(0, 5 - rev.rating))].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-text-light/30" />
                        ))}
                      </div>
                      <span className="text-text-light font-bold text-[10px]">&bull;</span>
                      <span className="text-[10px] text-text-light font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                      </span>
                    </div>

                    {/* Comment with toggle line-height */}
                    <p className={`text-xs text-text-secondary leading-relaxed font-semibold ${expandedReviews[rev.id] ? "" : "line-clamp-3"}`}>
                      {formatCommentText(rev.comment)}
                    </p>
                    {rev.comment.length > 180 && (
                      <button
                        type="button"
                        onClick={() => toggleExpandReview(rev.id)}
                        className="text-xs font-bold text-text-primary underline hover:text-theme-primary mt-1 block cursor-pointer"
                      >
                        {expandedReviews[rev.id] ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {reviews.length > 6 && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsAllReviewsOpen(true)}
                  className="bg-bg-secondary border border-text-primary text-text-primary hover:bg-opacity-80 font-bold py-2.5 px-5 text-xs rounded-none transition cursor-pointer"
                >
                  Show all {reviews.length} reviews
                </button>
              </div>
            )}

            {/* Leave a Review Form */}
            <form onSubmit={handleReviewSubmit} className="border border-border-custom p-6 bg-bg-secondary/40 space-y-4 rounded-none mt-6">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Leave a Review</h4>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-text-secondary">Your Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= newRating ? "text-amber-500 fill-current animate-pulse" : "text-text-light"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary block">Comment</label>
                <textarea
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your stay experience details..."
                  className="w-full bg-bg-primary border border-border-custom p-3 text-xs text-text-primary outline-none focus:border-theme-primary h-24 rounded-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPostingReview}
                className="bg-btn-primary text-btn-text-primary font-bold py-2.5 px-6 text-xs hover:bg-opacity-95 transition rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Sticky Airbnb Style Booking Card & Policies */}
        <div className="space-y-6 relative">
          
          <div className="bg-bg-primary border border-border-custom p-6 shadow-xl space-y-5 rounded-none lg:sticky lg:top-24">
            
            {/* Dynamic Price Header */}
            {!checkInDate || !checkOutDate ? (
              <div>
                <h2 className="text-xl font-extrabold text-text-primary tracking-wide">Add dates for prices</h2>
                <p className="text-xs text-text-light mt-1 font-semibold">Select stay range to unlock rates</p>
              </div>
            ) : (
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xl font-extrabold text-theme-secondary">
                    BDT {(selectedRoom?.b2cPrice || hotel.rooms?.[0]?.b2cPrice || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-text-light font-semibold"> / night</span>
                </div>
                {hotel.isVerified && (
                  <span className="text-[10px] text-emerald-600 font-bold border border-emerald-200 bg-emerald-50 px-2 py-0.5 uppercase">
                    Verified stay
                  </span>
                )}
              </div>
            )}

            {/* Room selector dropdown */}
            {hotel.rooms && hotel.rooms.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Room Category
                </label>
                <select
                  value={selectedRoom?.id || ""}
                  onChange={(e) => {
                    const room = hotel.rooms.find((r: any) => r.id === e.target.value);
                    if (room) setSelectedRoom(room);
                  }}
                  className="w-full bg-bg-secondary border border-border-custom p-2 text-xs font-semibold text-text-primary outline-none focus:border-theme-primary rounded-none"
                >
                  {hotel.rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.type} (BDT {room.b2cPrice}/nt)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Room Count Quantity Selector */}
            {selectedRoom && (
              <div className="space-y-1.5 mt-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Rooms Count
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={roomQuantity <= 1}
                    onClick={() => setRoomQuantity(Math.max(1, roomQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-text-primary w-4 text-center">{roomQuantity}</span>
                  <button
                    type="button"
                    disabled={roomQuantity >= remainingAvailableRooms}
                    onClick={() => setRoomQuantity(roomQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-text-light">({remainingAvailableRooms} rooms left)</span>
                </div>
              </div>
            )}

            {/* Custom Input Grid (Check-In, Checkout, Guests) */}
            <div className="border border-border-custom rounded-none divide-y divide-border-custom overflow-hidden bg-bg-secondary relative">
              <div className="grid grid-cols-2 divide-x divide-border-custom">
                <div className="p-3 space-y-1 relative">
                  <label className="block text-[9px] font-extrabold text-text-secondary uppercase tracking-wider">Check-in</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    onClick={(e: any) => e.target.showPicker?.()}
                    className="w-full bg-transparent text-xs font-semibold text-text-primary outline-none cursor-pointer"
                  />
                </div>
                <div className="p-3 space-y-1 relative">
                  <label className="block text-[9px] font-extrabold text-text-secondary uppercase tracking-wider">Checkout</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    onClick={(e: any) => e.target.showPicker?.()}
                    className="w-full bg-transparent text-xs font-semibold text-text-primary outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Guest Selector Trigger */}
              <div 
                className="p-3 relative cursor-pointer" 
                onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
              >
                <label className="block text-[9px] font-extrabold text-text-secondary uppercase tracking-wider">Guests</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-text-primary">{guestText}</span>
                  <span className="text-xs text-text-light">▼</span>
                </div>
              </div>
            </div>

            {/* Airbnb Style Guest Selector Dropdown Modal */}
            {isGuestDropdownOpen && (
              <div className="absolute left-6 right-6 bg-bg-primary border border-border-custom shadow-2xl p-4 z-50 rounded-none space-y-4 animate-in fade-in duration-200 mt-1">
                {/* Adults Counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Adults</h4>
                    <p className="text-[10px] text-text-light">Age 13+</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdults(Math.max(1, adults - 1));
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-text-primary w-4 text-center">{adults}</span>
                    <button
                      type="button"
                      disabled={totalGuests >= currentMaxCapacity}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdults(adults + 1);
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Children</h4>
                    <p className="text-[10px] text-text-light">Ages 2-12</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChildren(Math.max(0, children - 1));
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-text-primary w-4 text-center">{children}</span>
                    <button
                      type="button"
                      disabled={totalGuests >= currentMaxCapacity}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChildren(children + 1);
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants Counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Infants</h4>
                    <p className="text-[10px] text-text-light">Under 2</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      disabled={infants <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfants(Math.max(0, infants - 1));
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-text-primary w-4 text-center">{infants}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfants(infants + 1);
                      }}
                      className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:border-text-primary text-sm font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-custom pt-3 flex flex-col gap-1">
                  <p className="text-[9px] text-[#E11D48] font-bold">
                    Max occupancy for this category: {currentMaxCapacity} guest{currentMaxCapacity > 1 ? "s" : ""}.
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[9px] text-text-light max-w-[150px]">
                      Maximum occupancy limits apply.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGuestDropdownOpen(false);
                      }}
                      className="text-xs font-bold text-text-primary hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Reserve button */}
            {!checkInDate || !checkOutDate ? (
              <button
                onClick={() => {
                  toast.success("Please select stay dates in Check-in / Checkout to unlock pricing!");
                }}
                className="w-full bg-btn-primary text-btn-text-primary hover:bg-opacity-95 font-bold py-3 text-xs tracking-wider uppercase transition rounded-none cursor-pointer shadow-md"
              >
                Check Availability
              </button>
            ) : remainingAvailableRooms === 0 ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-bold py-3 text-xs tracking-wider uppercase rounded-none cursor-not-allowed shadow-md"
                >
                  Sold Out
                </button>
                <p className="text-[10px] text-red-500 font-bold text-center">
                  This room category is fully booked for the selected dates.
                </p>
              </div>
            ) : (
              <button
                onClick={handleConfirmLock}
                className="w-full bg-btn-primary text-btn-text-primary hover:bg-opacity-95 font-bold py-3 text-xs tracking-wider uppercase transition rounded-none cursor-pointer shadow-md"
              >
                Reserve Stay
              </button>
            )}

            <p className="text-[10px] text-text-light text-center">You won&apos;t be charged yet. This locks standard rates.</p>

            {/* Price calculation block (Show only if dates selected) */}
            {checkInDate && checkOutDate && (
              <div className="border-t border-border-custom pt-4 space-y-2.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span className="underline">
                    BDT {(selectedRoom?.b2cPrice || hotel.rooms?.[0]?.b2cPrice || 0).toLocaleString()} x {nights} nights x {roomQuantity} room(s)
                  </span>
                  <span>BDT {((selectedRoom?.b2cPrice || hotel.rooms?.[0]?.b2cPrice || 0) * nights * roomQuantity).toLocaleString()}</span>
                </div>
                {isTourOrganizer && selectedRoom?.b2bPrice && (
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-1.5 border border-emerald-100">
                    <span>B2B Partner Discount</span>
                    <span>
                      - BDT {((selectedRoom.b2cPrice - selectedRoom.b2bPrice) * nights * roomQuantity).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border-custom pt-2.5 font-bold text-text-primary text-sm">
                  <span>Total estimated cost</span>
                  <span>
                    BDT {
                      (
                        (isTourOrganizer && selectedRoom?.b2bPrice
                          ? selectedRoom.b2bPrice
                          : (selectedRoom?.b2cPrice || hotel.rooms?.[0]?.b2cPrice || 0)
                        ) * nights * roomQuantity
                      ).toLocaleString()
                    }
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Stay Policies card below it */}
          <div className="bg-bg-secondary border border-border-custom p-6 space-y-4 rounded-none">
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="h-4 w-4 text-theme-primary" />
              <span>Stay Policies</span>
            </h4>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed font-semibold">
              <p>
                <strong>Check-in:</strong> {hotel.checkInTime || "14:00"} onwards. Please bring a valid photo identification card.
              </p>
              <p>
                <strong>Check-out:</strong> {hotel.checkOutTime || "12:00"} noon. Late check-outs might be billed extra.
              </p>
              <p>
                <strong>Cancellation:</strong> Bookings cancelled 48 hours prior to check-in qualify for a full refund. Later cancellations are subject to a single night fee.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhotoIdx !== null && (
        <div
          onClick={() => setActivePhotoIdx(null)}
          className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Main Modal Wrapper (stops background click closure on content click) */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setActivePhotoIdx(null)}
              className="absolute top-4 right-4 z-50 text-white bg-black/60 hover:bg-black/85 p-2 rounded-full border border-gray-700 font-extrabold text-sm w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Photo Slide Area */}
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Left Navigation Arrow */}
              {allPhotos.length > 1 && (
                <button
                  onClick={() => setActivePhotoIdx(prev => prev === null ? null : (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                  className="absolute left-4 z-40 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-gray-800 transition cursor-pointer flex items-center justify-center"
                  aria-label="Previous Photo"
                >
                  <ArrowLeft className="h-6.5 w-6.5 text-white" />
                </button>
              )}

              {/* Image element */}
              <img
                src={allPhotos[activePhotoIdx]}
                alt={`Full screen view - ${activePhotoIdx + 1}`}
                className="max-h-[80vh] max-w-full object-contain shadow-2xl transition-all duration-300"
              />

              {/* Right Navigation Arrow */}
              {allPhotos.length > 1 && (
                <button
                  onClick={() => setActivePhotoIdx(prev => prev === null ? null : (prev === allPhotos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 z-40 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-gray-800 transition cursor-pointer flex items-center justify-center"
                  aria-label="Next Photo"
                >
                  <ArrowRight className="h-6.5 w-6.5 text-white" />
                </button>
              )}
            </div>

            {/* Photo Counter Label */}
            <div className="absolute bottom-4 bg-black/75 px-4 py-1.5 text-xs text-white font-bold tracking-widest uppercase">
              Photo {activePhotoIdx + 1} of {allPhotos.length}
            </div>
          </div>
        </div>
      )}

      {/* Show All Reviews Drawer Modal */}
      {isAllReviewsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[998] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg-primary max-w-3xl w-full max-h-[85vh] p-8 overflow-y-auto relative rounded-none border border-border-custom space-y-6 animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center border-b border-border-custom pb-4">
              <h3 className="text-xl font-bold text-text-primary">
                {averageRating} &bull; {reviews.length} Reviews
              </h3>
              <button
                onClick={() => setIsAllReviewsOpen(false)}
                className="text-text-secondary hover:text-text-primary text-xl font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 divider-y divider-border-custom">
              {reviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="space-y-3 pt-2">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-sm border border-theme-primary/20 shrink-0">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary capitalize">{rev.name}</h4>
                      <p className="text-[9px] text-text-light font-semibold">Verified Traveler</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex space-x-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                      {[...Array(Math.max(0, 5 - rev.rating))].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-text-light/30" />
                      ))}
                    </div>
                    <span className="text-text-light font-bold text-[10px]">&bull;</span>
                    <span className="text-[10px] text-text-light font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                    {formatCommentText(rev.comment)}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Room Details Modal Popup */}
      {selectedDetailRoom && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg-primary max-w-3xl w-full max-h-[85vh] p-8 overflow-y-auto relative rounded-none border border-border-custom space-y-6 animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border-custom pb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary capitalize">{selectedDetailRoom.type}</h3>
                <p className="text-xs text-text-light font-semibold mt-0.5">Category Details & Photos</p>
              </div>
              <button
                onClick={() => setSelectedDetailRoom(null)}
                className="text-text-secondary hover:text-text-primary text-xl font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photos Grid inside Modal */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Room Image Gallery</span>
              {selectedDetailRoom.photos && selectedDetailRoom.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDetailRoom.photos.map((photo: string, pIdx: number) => (
                    <div key={pIdx} className="h-48 bg-bg-secondary border border-border-custom overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`${selectedDetailRoom.type} - Gallery ${pIdx + 1}`}
                        className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text-light border border-dashed border-border-custom text-xs font-semibold">
                  No interior photos uploaded for this room type category yet.
                </div>
              )}
            </div>

            {/* Specs details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-custom/50 pt-5 text-xs text-text-secondary font-semibold">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-text-light font-bold block uppercase">Pricing Rates</span>
                  <p className="text-lg font-extrabold text-theme-secondary mt-1">
                    BDT {selectedDetailRoom.b2cPrice.toLocaleString()} <span className="text-xs font-semibold text-text-light">/ Night</span>
                  </p>
                  {isTourOrganizer && selectedDetailRoom.b2bPrice && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-none flex items-center space-x-1 w-fit">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                      <span>B2B PARTNER RATE: BDT {selectedDetailRoom.b2bPrice.toLocaleString()} / Night</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-text-light font-bold block uppercase">Available Inventory</span>
                  <p className="text-text-primary font-bold mt-0.5">{selectedDetailRoom.inventory} Rooms remaining in stock</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-text-light font-bold block uppercase font-title mb-1.5">Amenities Included</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetailRoom.amenities && selectedDetailRoom.amenities.length > 0 ? (
                      selectedDetailRoom.amenities.map((amt: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-bg-secondary border border-border-custom text-text-secondary px-2.5 py-0.5 rounded-none"
                        >
                          {amt}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-light italic">Standard stay amenities.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex justify-end space-x-2.5 pt-4 border-t border-border-custom">
              <button
                type="button"
                onClick={() => setSelectedDetailRoom(null)}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-bg-secondary transition border border-border-custom cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoom(selectedDetailRoom);
                  setSelectedDetailRoom(null);
                  toast.success(`${selectedDetailRoom.type} locked in the reservation checkout panel!`);
                  window.scrollTo({ top: 450, behavior: "smooth" });
                }}
                className="bg-btn-primary text-btn-text-primary font-bold px-5 py-2 text-xs hover:bg-opacity-95 transition rounded-none cursor-pointer"
              >
                Select Room Category
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
