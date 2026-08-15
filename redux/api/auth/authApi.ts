import baseApi from "../baseApi";

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    resendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    logIn: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    becomeVendor: builder.mutation({
      query: (body) => ({
        url: "/users/become-vendor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    uploadFile: builder.mutation({
      query: (body) => ({
        url: "/users/upload",
        method: "POST",
        body,
      }),
    }),
    switchRole: builder.mutation({
      query: (body) => ({
        url: "/users/switch-role",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSignUpMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useLogInMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useBecomeVendorMutation,
  useSwitchRoleMutation,
  useGetMeQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadFileMutation,
} = authApi;
