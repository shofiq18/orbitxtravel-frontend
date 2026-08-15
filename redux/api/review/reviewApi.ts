import baseApi from "../baseApi";

export const reviewApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: () => ({
        url: "/reviews",
        method: "GET",
      }),
      providesTags: ["Review"],
    }),
    getReviewsByHotel: builder.query({
      query: (hotelId: string) => ({
        url: `/reviews/hotel/${hotelId}`,
        method: "GET",
      }),
      providesTags: ["Review"],
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewsByHotelQuery,
  useCreateReviewMutation,
} = reviewApi;
