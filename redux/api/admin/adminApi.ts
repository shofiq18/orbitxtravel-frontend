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
    getEscrowBookings: builder.query({
      query: () => ({
        url: "/admin/escrow-bookings",
        method: "GET",
      }),
      providesTags: ["User"],
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
    createAdvanceRequest: builder.mutation({
      query: (body) => ({
        url: "/admin/advance-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getMyAdvanceRequests: builder.query({
      query: () => ({
        url: "/admin/advance-requests/my",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getAllAdvanceRequests: builder.query({
      query: () => ({
        url: "/admin/advance-requests/all",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    inspectAndDisburseAdvance: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/advance-requests/${id}/disburse`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getCommissionRate: builder.query({
      query: () => ({
        url: "/admin/commission-rate",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateCommissionRate: builder.mutation({
      query: (body) => ({
        url: "/admin/commission-rate",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getMilestoneDisbursals: builder.query({
      query: () => ({
        url: "/admin/milestones/disbursals",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    disburseFinalMilestone: builder.mutation({
      query: (body) => ({
        url: "/admin/milestones/disburse-final",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetVendorsQueueQuery,
  useVerifyVendorMutation,
  useGetEscrowBookingsQuery,
  useGetCommissionsQuery,
  useGetCommissionRateQuery,
  useUpdateCommissionRateMutation,
  useGetPayoutsQuery,
  useReleasePayoutMutation,
  useTriggerPreTripAlertsMutation,
  useGetUsersQuery,
  useSuspendUserMutation,
  useCreateAdvanceRequestMutation,
  useGetMyAdvanceRequestsQuery,
  useGetAllAdvanceRequestsQuery,
  useInspectAndDisburseAdvanceMutation,
  useGetMilestoneDisbursalsQuery,
  useDisburseFinalMilestoneMutation,
} = adminApi;
