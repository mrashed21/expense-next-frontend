import { apiSlice } from "./apiSlice";

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
} = adminApi;
