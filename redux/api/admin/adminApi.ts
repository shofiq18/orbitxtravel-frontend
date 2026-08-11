import baseApi from "../baseApi";

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getVendorsQueue: builder.query({
      query: () => ({
        url: "/admin/vendors",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    verifyVendor: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/admin/vendors/${userId}/verify`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getCommissions: builder.query({
      query: () => ({
        url: "/admin/commissions",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getPayouts: builder.query({
      query: () => ({
        url: "/admin/payouts",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    releasePayout: builder.mutation({
      query: (body) => ({
        url: "/admin/payouts/release",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    triggerPreTripAlerts: builder.mutation({
      query: () => ({
        url: "/admin/pretrip-alerts",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/suspend`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetVendorsQueueQuery,
  useVerifyVendorMutation,
  useGetCommissionsQuery,
  useGetPayoutsQuery,
  useReleasePayoutMutation,
  useTriggerPreTripAlertsMutation,
  useGetUsersQuery,
  useSuspendUserMutation,
} = adminApi;
