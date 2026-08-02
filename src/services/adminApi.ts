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
  useGetSystemHealthQuery,
  useGetActivityQuery,
} = adminApi;
