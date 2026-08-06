import { apiSlice } from "./api-slice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params,
      }),
      providesTags: ["AdminUsers"] as any,
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminUsers"] as any,
    }),
    getAdmins: builder.query({
      query: () => ({
        url: "/admin/admins",
        method: "GET",
      }),
      providesTags: ["AdminUsers"] as any,
    }),
    createAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/admins",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminUsers"] as any,
    }),
    updateAdminStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/admins/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminUsers"] as any,
    }),
    getSystemHealth: builder.query({
      query: () => ({
        url: "/admin/system-health",
        method: "GET",
      }),
      providesTags: ["AdminSystemHealth"] as any,
    }),
    getActivity: builder.query({
      query: () => ({
        url: "/admin/activity",
        method: "GET",
      }),
      providesTags: ["AdminActivity"] as any,
    }),
    getNotificationHistory: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/admin/notifications?page=${page}&limit=${limit}`,
      }),
      providesTags: ["AdminNotifications"] as any,
    }),
    getDashboardStats: builder.query({
      query: () => ({
        url: "/admin/dashboard-stats",
        method: "GET",
      }),
      providesTags: ["AdminDashboard"] as any,
    }),
    getUserGrowth: builder.query({
      query: () => ({
        url: "/admin/user-growth",
        method: "GET",
      }),
      providesTags: ["AdminDashboard"] as any,
    }),
    getErrorLogs: builder.query({
      query: (params) => ({
        url: "/admin/error-logs",
        method: "GET",
        params,
      }),
      providesTags: ["AdminLogs"] as any,
    }),
    getAuditLogs: builder.query({
      query: (params) => ({
        url: "/admin/audit-logs",
        method: "GET",
        params,
      }),
      providesTags: ["AdminLogs"] as any,
    }),
    broadcastNotification: builder.mutation({
      query: (data) => ({
        url: "/admin/broadcast",
        method: "POST",
        body: data,
      }),
    }),
    updateAdminProfile: builder.mutation({
      query: (data) => ({
        url: "/admin/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminUsers"] as any,
    }),
    updateAdminProfileImage: builder.mutation({
      query: (formData) => ({
        url: "/admin/profile-image",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["AdminUsers"] as any,
    }),
    globalAdminSearch: builder.query({
      query: (q) => ({
        url: "/admin/search",
        params: { q },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminStatusMutation,
  useGetSystemHealthQuery,
  useGetActivityQuery,
  useGetNotificationHistoryQuery,
  useGetDashboardStatsQuery,
  useGetUserGrowthQuery,
  useGetErrorLogsQuery,
  useGetAuditLogsQuery,
  useBroadcastNotificationMutation,
  useUpdateAdminProfileMutation,
  useUpdateAdminProfileImageMutation,
  useGlobalAdminSearchQuery,
  useLazyGlobalAdminSearchQuery,
} = adminApi;
