import baseApi from "../baseApi";

export const tourApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPackages: builder.query({
      query: (params) => ({
        url: "/tours",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getPackageById: builder.query({
      query: (id) => ({
        url: `/tours/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createPackage: builder.mutation({
      query: (body) => ({
        url: "/tours",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
} = tourApi;
