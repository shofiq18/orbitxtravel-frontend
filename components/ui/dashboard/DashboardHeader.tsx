"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMeQuery } from "@/redux/api/auth/authApi";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function DashboardHeader() {
  const hasAccessToken = useSelector((state: RootState) => !!state.user.accessToken);
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: !hasAccessToken,
    refetchOnMountOrArgChange: true,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Can add breadcrumbs or title here */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-xl ml-8 font-bold text-gray-900">
             {user?.data?.name || "Dashboard"}
            </h1>
          </div>

          {/* Right side - User info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User details - hidden on mobile */}
            <div className="hidden sm:block text-right">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.data?.name || "Admin"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 capitalize">
                    {user?.data?.role || "Administrator"}
                  </p>
                </>
              )}
            </div>

            {/* Avatar */}
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-[#314B79] ring-offset-2 transition-transform hover:scale-105">
              <AvatarImage
                src={user?.data?.profilePicture || ""}
                alt={user?.data?.name || "Admin"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#314B79] to-[#4A6FA5] text-white font-semibold text-sm sm:text-base">
                {user?.data?.name ? user.data.name.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}