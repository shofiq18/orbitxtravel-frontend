// hooks/useGetMe.ts
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { RootState } from "../redux/store";

import Cookies from "js-cookie";
import { logout, setCredentials } from "@/feature/user/userSlice";
import { useGetMeQuery } from "@/redux/api/auth/authApi";

export const useGetMe = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const { user, accessToken } = useSelector((state: RootState) => state.user);

    // Use the API query to fetch data from the backend
    const {
        data: meData,
        isLoading: isMeLoading,
        isError,
    } = useGetMeQuery(undefined, {
        skip: !Cookies.get("accessToken"), // Skip if no token is present
    });

    useEffect(() => {
        if (meData?.success && meData?.data) {
            const token = Cookies.get("accessToken");
            if (token) {
                dispatch(
                    setCredentials({
                        user: {
                            id: meData.data.id,
                            name: meData.data.name,
                            email: meData.data.email,
                            role: meData.data.role,
                        },
                        accessToken: token,
                    }),
                );
            }
        } else if (isError) {
            // If there's an error (e.g., unauthorized), clear credentials
            dispatch(logout());
        }
    }, [meData, isError, dispatch]);

    const role = user?.role;
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN" || role === "SUPER_ADMIN";

    return {
        user: user ?? null,
        role,
        isAdmin,
        isLoading: isMeLoading,
        isAuthenticated: !!accessToken,
    };
};
