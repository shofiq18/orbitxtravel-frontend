"use client";

import { useForgotPasswordMutation, useResetPasswordMutation } from "@/redux/api/auth/authApi";
import { ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { toast } from "react-hot-toast";

// Centered Brand Logo Icon Only (No Text)
function BrandLogo() {
  return (
    <div className="flex justify-center mb-6">
      <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
        <Globe className="h-10 w-10 text-theme-primary" />
      </Link>
    </div>
  );
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  
  // Separated 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Resend OTP countdown timer
  const [timer, setTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const router = useRouter();

  // Countdown timer effect for Step 2
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Focus first OTP input when entering Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      setTimer(60);
      setIsTimerActive(true);
    }
  }, [step]);

  // Handle single digit input change
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste 6-digit OTP code
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const digits = pastedData.split("");
      const newOtp = [...Array(6)].map((_, i) => digits[i] || "");
      setOtpDigits(newOtp);
      const nextFocusIndex = Math.min(digits.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response?.message || "OTP code sent to your email!");
      setStep(2);
    } catch (error: any) {
      const err = error?.data?.message || "Failed to send reset code. Please verify your email.";
      setErrorMsg(err);
      toast.error(err);
    }
  };

  // Resend OTP Trigger
  const handleResendOtp = async () => {
    if (isTimerActive || isSendingOtp) return;
    setErrorMsg("");

    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response?.message || "New OTP code sent to your email!");
      setOtpDigits(Array(6).fill(""));
      setTimer(60);
      setIsTimerActive(true);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const err = error?.data?.message || "Failed to resend OTP code.";
      setErrorMsg(err);
      toast.error(err);
    }
  };

  // Step 2: Verify Code -> Proceed to Step 3
  const handleVerifyCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    setStep(3);
  };

  // Step 3: Reset Password with OTP
  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Verification code is missing. Please go back and enter code.");
      setStep(2);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await resetPassword({ email, otp: fullOtp, newPassword }).unwrap();
      toast.success(response?.message || "Password reset successfully! Please log in.");
      router.push("/login");
    } catch (error: any) {
      const err = error?.data?.message || "Failed to reset password. Please check your OTP and try again.";
      setErrorMsg(err);
      toast.error(err);
      if (err.toLowerCase().includes("otp")) {
        setStep(2);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-6 bg-bg-primary">
      <div className="w-full max-w-md bg-bg-primary p-4 sm:p-6 text-center">

        {/* Brand Logo Icon Only */}
        <BrandLogo />

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 text-sm text-red-700 border border-red-200 bg-red-50 text-center rounded-none">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: FORGOT PASSWORD? */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight text-center mb-3">
              Forgot Password?
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed text-center mb-8 max-w-xs mx-auto">
              Enter your email address and we&#39;ll send you a 6-digit OTP to reset your password.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-6 text-left">
              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block mb-2 text-xs font-semibold text-text-secondary text-left">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-light">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full py-3 pl-10 pr-4 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-colors rounded-none placeholder-text-light"
                  />
                </div>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-btn-primary text-btn-text-primary font-bold py-3.5 px-6 flex justify-center items-center space-x-2.5 transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer hover:bg-opacity-90 rounded-none text-sm tracking-wide"
              >
                <span>{isSendingOtp ? "Sending OTP..." : "Send OTP"}</span>
                {!isSendingOtp && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-text-secondary">
              Remember your password?{" "}
              <Link href="/login" className="font-bold text-theme-primary hover:underline">
                Log In
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER VERIFICATION CODE */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight text-center mb-4">
              Enter Verification Code
            </h1>

            {/* Small Mail Icon */}
            <div className="flex justify-center mb-2">
              <Mail className="h-5 w-5 text-theme-primary" />
            </div>

            <p className="text-sm text-text-secondary leading-relaxed text-center mb-6 max-w-xs mx-auto">
              We sent a 6-digit verification code to<br />
              <strong className="text-text-primary font-bold break-all">{email}</strong>
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <p className="text-xs text-text-secondary text-center mb-3">
                  Enter the 6-digit code
                </p>

                {/* 6 Square OTP Input Boxes */}
                <div className="flex justify-center items-center space-x-2 sm:space-x-2.5 my-4">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-text-primary bg-bg-secondary border border-border-custom focus:border-theme-primary focus:bg-bg-primary outline-none transition-colors rounded-none"
                    />
                  ))}
                </div>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                className="w-full bg-btn-primary text-btn-text-primary font-bold py-3.5 px-6 flex justify-center items-center space-x-2.5 transition cursor-pointer hover:bg-opacity-90 rounded-none text-sm tracking-wide"
              >
                <span>Verify Code</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Resend Code Timer */}
            <div className="mt-6 text-center text-xs text-text-secondary">
              Didn&#39;t receive the code?{" "}
              {isTimerActive ? (
                <span className="text-theme-primary font-semibold">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="font-bold text-theme-primary underline cursor-pointer hover:opacity-80"
                >
                  {isSendingOtp ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>

            {/* Back to Email Input */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-text-light hover:text-text-primary transition-colors cursor-pointer"
              >
                &larr; Back to Email Input
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CREATE NEW PASSWORD */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight text-center mb-3">
              Reset Password
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed text-center mb-8 max-w-xs mx-auto">
              Create a new secure password for your account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5 text-left">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block mb-1.5 text-xs font-semibold text-text-secondary text-left">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-light">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full py-3 pl-10 pr-10 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-colors rounded-none placeholder-text-light"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-light hover:text-text-primary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block mb-1.5 text-xs font-semibold text-text-secondary text-left">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-light">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full py-3 pl-10 pr-10 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-colors rounded-none placeholder-text-light"
                  />
                </div>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-btn-primary text-btn-text-primary font-bold py-3.5 px-6 flex justify-center items-center space-x-2.5 transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer hover:bg-opacity-90 rounded-none text-sm tracking-wide mt-2"
              >
                <span>{isResetting ? "Resetting Password..." : "Reset Password"}</span>
                {!isResetting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-text-light hover:text-text-primary transition-colors cursor-pointer"
              >
                &larr; Back to Verification Code
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
