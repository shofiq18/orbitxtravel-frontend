import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface UserProfile {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  roles?: string[];
  currentRole?: string;
  isVerified?: boolean;
  role?: string;
  businessProfile?: any;
}

interface UserState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: UserProfile;
        accessToken: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;

      const isSecure =
        typeof window !== "undefined" && window.location.protocol === "https:";

      // set main token
      Cookies.set("accessToken", action.payload.accessToken, {
        secure: isSecure,
        sameSite: "strict",
        expires: 7,
        path: "/",
      });

      // set refresh token if exists
      if (action.payload.refreshToken) {
        Cookies.set("refreshToken", action.payload.refreshToken, {
          secure: isSecure,
          sameSite: "strict",
          expires: 7,
          path: "/",
        });
      }
    },
    updateActiveRole: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.currentRole = action.payload;
      }
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      const isSecure =
        typeof window !== "undefined" && window.location.protocol === "https:";

      Cookies.remove("accessToken", { path: "/", secure: isSecure });
      Cookies.remove("refreshToken", { path: "/", secure: isSecure });
    },
  },
});

export const { setCredentials, logout, updateActiveRole, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;