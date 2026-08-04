



import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        headers.set("Authorization", accessToken);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    "User",
  ],
});

export default baseApi;