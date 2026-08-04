"use client";


import { DashboardHeader } from "@/components/ui/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/ui/dashboard/DashboardSidebar";
import { useGetMe } from "@/hooks/useGetMe";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const { isAdmin, isLoading, isAuthenticated } = useGetMe();
    // const router = useRouter();

    // useEffect(() => {
    //     if (!isLoading) {
    //         if (!isAuthenticated) {
    //             router.replace("/login");
    //         } else if (!isAdmin) {
    //             router.replace("/");
    //         }
    //     }
    // }, [isAdmin, isLoading, isAuthenticated, router]);

    // if (isLoading) {
    //     return (
    //         <div className="h-screen w-screen flex items-center justify-center bg-white text-blue-600 font-semibold">
    //             <Loader className="animate-spin" size={32} color="#2563eb" />
    //         </div>
    //     );
    // }

    // if (!isAdmin) {
    //     return null; // Return null while redirecting
    // }

    return (
        <div className="flex h-screen  overflow-hidden">
            <DashboardSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 p-8 overflow-y-auto bg-white">{children}</main>
            </div>
        </div>
    );
}
