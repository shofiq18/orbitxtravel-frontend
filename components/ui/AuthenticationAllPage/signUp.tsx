"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUpMutation, useVerifyEmailMutation, useResendOtpMutation } from "@/redux/api/auth/authApi";
import { Mail, User, Lock, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface FormErrors {
  general?: string;
  fullName?: string;
  email?: string;
  password?: string;
  otp?: string;
}

export default function SignUpForm() {
  const [step, setStep] = useState<"register" | "otp" | "success">("register");
  
  // Registration form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP inputs
  const [otp, setOtp] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);

  const handleOtpBoxChange = (value: string, index: number) => {
    if (value && isNaN(Number(value))) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);
    setOtp(newOtp.join(""));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpBoxPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
      const newOtp = pastedData.split("");
      setOtpArray(newOtp);
      setOtp(pastedData);
      const lastInput = document.getElementById(`otp-input-5`);
      lastInput?.focus();
    }
  };

  const [errors, setErrors] = useState<FormErrors>({});
  
  const [signUpApi, { isLoading: isRegistering }] = useSignUpMutation();
  const [verifyEmailApi, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtpApi, { isLoading: isResending }] = useResendOtpMutation();
  
  const router = useRouter();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!fullName || !email || !password) {
      setErrors({ general: "Please fill out all fields." });
      return;
    }

    try {
      const response = await signUpApi({ fullName, email, password }).unwrap();
      toast.success(response?.message || "Registration pending. Verification code sent.");
      setStep("otp");
    } catch (error: any) {
      const errMsg = error?.data?.message || "Registration failed. Try using another email.";
      setErrors({ general: errMsg });
      toast.error(errMsg);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp) {
      setErrors({ otp: "Please enter the verification code." });
      return;
    }

    try {
      const response = await verifyEmailApi({ email, otp }).unwrap();
      toast.success(response?.message || "Email verified successfully!");
      setStep("success");
    } catch (error: any) {
      const errMsg = error?.data?.message || "Invalid OTP code. Please check your email.";
      setErrors({ otp: errMsg });
      toast.error(errMsg);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await resendOtpApi({ email }).unwrap();
      toast.success(response?.message || "OTP resent to your email.");
      setOtpArray(["", "", "", "", "", ""]);
      setOtp("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg bg-bg-primary shadow-none p-6 sm:p-8 md:p-10 rounded-none">
        
        {/* Step 1: Registration Form */}
        {step === "register" && (
          <div>
            <div className="mb-8 text-left">
              <h1 className="text-3xl font-semibold text-text-primary tracking-wide">Create Account</h1>
              <p className="mt-2 text-base text-text-secondary">
                Register as a Traveler on OrbitX Travel.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-none">
                  {errors.general}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block mb-2 text-base font-semibold text-text-secondary">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-text-light">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="block w-full py-3 pl-12 pr-5 text-base text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block mb-2 text-base font-semibold text-text-secondary">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-text-light">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full py-3 pl-12 pr-5 text-base text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-base font-semibold text-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-text-light">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full py-3 pl-12 pr-5 text-base text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-btn-primary text-btn-text-primary font-bold py-4 px-6 flex justify-center items-center space-x-2 transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer hover:bg-opacity-90 rounded-none text-base pt-3"
              >
                <span>{isRegistering ? "Creating account..." : "Sign Up"}</span>
                {!isRegistering && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-8 text-center text-base border-t border-border-custom pt-6">
              <p className="text-text-secondary text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-theme-primary hover:underline">
                  Log In
                </Link>
              </p>
              <p className="mt-4">
                <Link href="/" className="text-sm text-text-light hover:text-text-secondary">
                  &larr; Back to Home
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <div>
            <div className="mb-8 text-left">
              <ShieldAlert className="h-14 w-14 text-theme-secondary mb-3" />
              <h1 className="text-3xl font-semibold text-text-primary tracking-wide">Verify Email</h1>
              <p className="mt-2 text-base text-text-secondary">
                We sent a 6-digit verification code to <span className="font-bold">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {errors.otp && (
                <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-none text-center">
                  {errors.otp}
                </div>
              )}

              {/* OTP Inputs: 6 individual border inputs */}
              <div>
                <div className="flex justify-center space-x-3 py-6">
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpBoxKeyDown(e, idx)}
                      onPaste={handleOtpBoxPaste}
                      className="w-14 h-14 text-center text-2xl font-bold text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary focus:bg-bg-primary transition-all rounded-none"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-btn-primary text-btn-text-primary font-bold py-4 px-6 flex justify-center items-center transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer hover:bg-opacity-90 rounded-none text-base"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4 text-sm font-semibold">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm font-bold text-theme-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend Verification Code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-sm text-text-light hover:text-text-secondary cursor-pointer"
              >
                &larr; Change email address
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="text-center py-6 flex flex-col items-center justify-center max-w-md mx-auto">
            <CheckCircle2 className="h-20 w-20 text-theme-secondary mb-4" />
            <h1 className="text-3xl font-semibold text-text-primary tracking-wide">Verified!</h1>
            <p className="mt-2 text-base text-text-secondary">
              Your email verification was successful. You can now log in to access all traveling and hosting workspaces.
            </p>
            
            <Link
              href="/login"
              className="mt-8 block w-full bg-btn-primary text-btn-text-primary font-bold py-4 px-6 transition hover:bg-opacity-90 rounded-none text-base text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
