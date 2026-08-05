import { apiSlice } from "./api-slice";

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
    generate2FA: builder.mutation({
      query: () => ({
        url: "/users/2fa/generate",
        method: "POST",
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: "/users/2fa/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    disable2FA: builder.mutation({
      query: () => ({
        url: "/users/2fa/disable",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    getDevices: builder.query({
      query: () => "/users/devices",
      providesTags: ["User"],
    }),
    revokeDevice: builder.mutation({
      query: (deviceId) => ({
        url: `/users/devices/${deviceId}`,
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
  useGenerate2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
  useGetDevicesQuery,
  useRevokeDeviceMutation,
} = userApi;
