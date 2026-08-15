"use client";

import { setCredentials } from "@/feature/user/userSlice";
import { useLogInMutation } from "@/redux/api/auth/authApi";
import { ArrowRight, Lock, Mail, Eye, EyeOff, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

interface FormErrors {
  general?: string;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [signIn, { isLoading }] = useLogInMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!email || !password) {
      setErrors({ general: "Please enter both email and password." });
      return;
    }

    try {
      const response = await signIn({ email, password }).unwrap();

      if (!response?.data?.token) {
        throw new Error("Invalid response schema from authentication server");
      }

      const token = response.data.token;
      const user = response.data.user;

      dispatch(
        setCredentials({
          user,
          accessToken: token,
        })
      );

      toast.success("Logged in successfully!");

      // Route users based on role
      if (user.currentRole === "admin") {
        router.push("/dashboard/admin");
      } else if (user.currentRole === "hotel_owner") {
        router.push("/dashboard/hotel-owner");
      } else if (user.currentRole === "tour_organizer") {
        router.push("/dashboard/tour-organizer");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Invalid email or password. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg bg-bg-primary shadow-none p-6 sm:p-8 md:p-10 rounded-none text-center">
        
        {/* Brand Logo Icon Only */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
            <Globe className="h-10 w-10 text-theme-primary" />
          </Link>
        </div>

        {/* Header - Centered */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-text-primary tracking-wide text-center">Welcome Back</h1>
          <p className="mt-2 text-base text-text-secondary text-center max-w-sm mx-auto">
            Log in to manage your bookings or listing workspaces.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {errors.general && (
            <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-none text-left">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 text-base font-semibold text-text-secondary text-left">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-text-light">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                id="email"
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
            <label htmlFor="password" className="block mb-2 text-base font-semibold text-text-secondary text-left">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4.5 pointer-events-none text-text-light">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full py-3 pl-12 pr-12 text-base text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-light hover:text-text-secondary cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-theme-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-btn-primary text-btn-text-primary font-bold py-4 px-6 flex justify-center items-center space-x-2 transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer hover:bg-opacity-90 rounded-none text-base"
          >
            <span>{isLoading ? "Signing in..." : "Log In"}</span>
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-base border-t border-border-custom pt-6">
          <p className="text-text-secondary text-sm">
            Don&#39;t have an account?{" "}
            <Link href="/sign-up" className="font-bold text-theme-primary hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="mt-4">
            <Link href="/" className="text-sm text-text-light hover:text-text-secondary">
              &larr; Back to Home
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
