import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfileImage: builder.mutation({
      query: (formData) => ({
        url: "/users/profile-image",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/users/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    getLoginHistory: builder.query({
      query: () => "/users/login-history",
      providesTags: ["User"],
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/users/account",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useChangePasswordMutation,
  useGetLoginHistoryQuery,
  useDeleteAccountMutation,
} = userApi;
