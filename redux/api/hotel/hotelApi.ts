import baseApi from "../baseApi";

export const hotelApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHotels: builder.query({
      query: (params) => ({
        url: "/hotels",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getHotelById: builder.query({
      query: (id) => ({
        url: `/hotels/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createHotel: builder.mutation({
      query: (body) => ({
        url: "/hotels",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateHotel: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hotels/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    createRoom: builder.mutation({
      query: ({ hotelId, body }) => ({
        url: `/hotels/${hotelId}/rooms`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    blockRoomDates: builder.mutation({
      query: ({ roomId, body }) => ({
        url: `/hotels/rooms/${roomId}/block-dates`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getRoomAvailability: builder.query({
      query: ({ roomId, checkIn, checkOut }) => ({
        url: `/hotels/rooms/${roomId}/availability`,
        method: "GET",
        params: { checkIn, checkOut },
      }),
      providesTags: ["User"],
    }),
    getBlockedRoomDates: builder.query({
      query: ({ roomId }) => ({
        url: `/hotels/rooms/${roomId}/blocked-dates`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getReviews: builder.query({
      query: (hotelId) => ({
        url: `/reviews/${hotelId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useCreateRoomMutation,
  useBlockRoomDatesMutation,
  useGetBlockedRoomDatesQuery,
  useGetRoomAvailabilityQuery,
  useGetReviewsQuery,
  useCreateReviewMutation,
} = hotelApi;
