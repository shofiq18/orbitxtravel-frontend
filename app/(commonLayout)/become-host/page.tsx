"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useBecomeVendorMutation, useUploadFileMutation } from "@/redux/api/auth/authApi";
import { ClipboardList, ShieldCheck, CheckCircle2, ChevronRight, Home, Compass, Landmark, UploadCloud, Trash2, FileText, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BecomeHostPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [becomeVendorApi, { isLoading }] = useBecomeVendorMutation();
  const [uploadFileApi] = useUploadFileMutation();
  const router = useRouter();

  // Form States
  const [vendorType, setVendorType] = useState<"hotel_owner" | "tour_organizer">("hotel_owner");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [verificationDocUrl, setVerificationDocUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDocUploading, setIsDocUploading] = useState(false);
  
  // Payout Details States
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");

  const [step, setStep] = useState<"form" | "submitted">("form");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsDocUploading(true);

    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("pdf");
    }

    const uploadReader = new FileReader();
    uploadReader.onloadend = async () => {
      try {
        const base64File = uploadReader.result as string;
        const res = await uploadFileApi({ file: base64File }).unwrap();
        if (res?.success && res?.data) {
          setVerificationDocUrl(res.data);
          toast.success("Document uploaded successfully to Cloudinary.");
        } else {
          throw new Error("Failed to retrieve upload URL");
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(err?.data?.message || err?.message || "Failed to upload document.");
        setFileName("");
        setFilePreview(null);
        setVerificationDocUrl("");
      } finally {
        setIsDocUploading(false);
      }
    };
    uploadReader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setFileName("");
    setVerificationDocUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in first to apply as a host.");
      router.push("/login");
      return;
    }

    if (!businessName || !address || !licenseNumber || !bankName || !accountNumber || !branch) {
      toast.error("Please fill in all required business and payout details.");
      return;
    }

    const payload = {
      vendorType,
      verificationDocUrl,
      businessProfile: {
        businessName,
        address,
        licenseNumber,
      },
      payoutDetails: {
        bankName,
        accountNumber,
        branch,
        bkashNumber: bkashNumber || undefined,
        nagadNumber: nagadNumber || undefined,
      },
    };

    try {
      const response = await becomeVendorApi(payload).unwrap();
      toast.success(response?.message || "Application submitted successfully!");
      setStep("submitted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit vendor application.");
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-12 min-h-[80vh]">
      
      {/* Page Title Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-wide">Become a Host</h1>
        <p className="mt-3 text-text-secondary text-base">
          Join OrbitX Travel to start listing your hotel rooms or constructing tour packages for travelers.
        </p>
      </div>

      {step === "form" ? (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-bg-primary border border-border-custom p-6 md:p-10 space-y-8 rounded-none">
          
          {/* Step Section 1: Choose Role Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2 border-b border-border-custom pb-2">
              <span className="bg-theme-primary text-text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-none">1</span>
              <span>Select Hosting Role Type</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVendorType("hotel_owner")}
                className={`flex items-start space-x-4 p-4 border text-left cursor-pointer transition-all rounded-none ${ vendorType === "hotel_owner" ? "border-theme-primary bg-bg-secondary" : "border-border-custom bg-bg-primary hover:bg-bg-secondary" }`}
              >
                <Home className={`h-8 w-8 shrink-0 ${vendorType === "hotel_owner" ? "text-theme-primary" : "text-text-light"}`} />
                <div>
                  <h4 className="font-semibold text-text-primary">Hotel Property Owner</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    List properties, manage rooms inventory, and configure public B2C rates alongside locked partner B2B rates.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVendorType("tour_organizer")}
                className={`flex items-start space-x-4 p-4 border text-left cursor-pointer transition-all rounded-none ${ vendorType === "tour_organizer" ? "border-theme-primary bg-bg-secondary" : "border-border-custom bg-bg-primary hover:bg-bg-secondary" }`}
              >
                <Compass className={`h-8 w-8 shrink-0 ${vendorType === "tour_organizer" ? "text-theme-primary" : "text-text-light"}`} />
                <div>
                  <h4 className="font-semibold text-text-primary">Tour Package Organizer</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Design custom itineraries, lock B2B hotel accommodations, and setup seat locks/deposits checks.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Step Section 2: Business details */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2 border-b border-border-custom pb-2">
              <span className="bg-theme-primary text-text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-none">2</span>
              <span>Business Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Registered Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder={vendorType === "hotel_owner" ? "e.g. Grand Palace Resorts Ltd." : "e.g. Pathfinders Tours & Travels"}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">License or Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder={vendorType === "hotel_owner" ? "e.g. LIC-49030-HOTEL" : "e.g. LIC-99302-TOUR"}
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Business Address *</label>
              <input
                type="text"
                required
                placeholder={vendorType === "hotel_owner" ? "e.g. Road 12, Banani Block E, Dhaka" : "e.g. Level 4, Cosmos Tower, Banani, Dhaka"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Verification Document (NID/License/Trade Certificate) *
              </label>
              
              {!filePreview ? (
                <div className="border border-dashed border-border-custom bg-bg-secondary/40 p-6 text-center hover:bg-bg-secondary transition rounded-none relative">
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="h-8 w-8 text-text-light mx-auto mb-2" />
                  <p className="text-xs font-bold text-text-primary">Click or drag file here to upload</p>
                  <p className="text-[10px] text-text-light mt-1">Supports PDF, PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="border border-border-custom bg-bg-secondary p-4 flex items-center justify-between gap-4 rounded-none relative">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {filePreview === "pdf" ? (
                      <FileText className="h-10 w-10 text-theme-primary shrink-0" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreview}
                        alt="Document Preview"
                        className="h-12 w-12 object-cover border border-border-custom shrink-0 rounded-none"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{fileName}</p>
                      <p className="text-[9px] text-theme-secondary font-semibold uppercase">
                        {isDocUploading ? "Uploading to Cloudinary..." : "Ready to submit"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 transition shrink-0 rounded-none cursor-pointer border border-transparent hover:border-red-200"
                    title="Remove document"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step Section 3: Payout Details */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2 border-b border-border-custom pb-2">
              <span className="bg-theme-primary text-text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-none">3</span>
              <span>Settlement & Payout Coordinates</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Bank Ltd."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1004920391039"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banani Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">bKash Merchant/Personal No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 01700000000"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Nagad Merchant/Personal No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 01800000000"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text-primary border border-border-custom bg-bg-secondary outline-none focus:border-theme-primary rounded-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-border-custom flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isDocUploading}
              className="bg-theme-primary text-text-white font-bold py-3 px-8 transition disabled:opacity-75 disabled:cursor-not-allowed hover:bg-opacity-95 rounded-none flex items-center space-x-2 cursor-pointer text-sm"
            >
              <span>{isLoading ? "Submitting application..." : "Submit Registration"}</span>
              {!isLoading && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

        </form>
      ) : (
        <div className="max-w-xl mx-auto bg-bg-primary border border-border-custom p-8 text-center space-y-6 rounded-none animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="h-16 w-16 text-theme-secondary mx-auto" />
          <h2 className="text-2xl font-semibold text-text-primary">Application Submitted!</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your application to become a <span className="font-bold text-theme-primary">{vendorType.replace("_", " ")}</span> has been successfully logged.
          </p>
          <div className="p-4 bg-bg-secondary border border-border-custom text-xs text-text-secondary text-left space-y-2 rounded-none">
            <p className="font-bold flex items-center space-x-1.5 text-text-primary">
              <Landmark className="h-3.5 w-3.5 text-theme-secondary" />
              <span>Next Verification Steps:</span>
            </p>
            <p>1. The OrbitX Travel Admin board will review your business license and trade coordinates.</p>
            <p>2. Upon document validation approval, your hosting credentials will be switched on.</p>
            <p>3. You will receive an automated verification email notification to switch workspaces.</p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-btn-secondary text-btn-text-secondary px-6 py-2.5 font-bold text-xs border border-border-custom rounded-none hover:bg-opacity-80 transition"
            >
              Return Home
            </Link>
            <Link
              href="/dashboard/profile"
              className="bg-btn-primary text-btn-text-primary px-6 py-2.5 font-bold text-xs rounded-none hover:bg-opacity-90 transition"
            >
              Check Profile Status
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
