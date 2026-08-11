"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMeQuery } from "@/redux/api/auth/authApi";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function DashboardHeader() {
  const hasAccessToken = useSelector((state: RootState) => !!state.user.accessToken);
  const { user: reduxUser } = useSelector((state: RootState) => state.user);
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: !hasAccessToken,
    refetchOnMountOrArgChange: true,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Dynamic welcome greeting */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-xl ml-8 font-semibold text-gray-900">
             Welcome, {reduxUser?.fullName || "User"}
            </h1>
          </div>

          {/* Right side - User avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-[#314B79] ring-offset-2 transition-transform hover:scale-105">
              <AvatarImage
                src={user?.data?.profilePicture || ""}
                alt={reduxUser?.fullName || "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#314B79] to-[#4A6FA5] text-white font-semibold text-sm sm:text-base">
                {reduxUser?.fullName ? reduxUser.fullName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}