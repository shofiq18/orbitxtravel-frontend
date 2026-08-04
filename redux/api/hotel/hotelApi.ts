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
    getBlockedRoomDates: builder.query({
      query: ({ roomId }) => ({
        url: `/hotels/rooms/${roomId}/blocked-dates`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useCreateHotelMutation,
  useCreateRoomMutation,
  useBlockRoomDatesMutation,
  useGetBlockedRoomDatesQuery,
} = hotelApi;
