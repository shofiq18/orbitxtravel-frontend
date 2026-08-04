import baseApi from "../baseApi";

export const bookingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (body) => ({
        url: "/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    payBooking: builder.mutation({
      query: ({ bookingId, body }) => ({
        url: `/bookings/${bookingId}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getBookingsByUser: builder.query({
      query: () => ({
        url: "/bookings",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getBookingById: builder.query({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  usePayBookingMutation,
  useGetBookingsByUserQuery,
  useGetBookingByIdQuery,
} = bookingApi;
