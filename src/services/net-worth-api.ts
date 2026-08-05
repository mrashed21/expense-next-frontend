import { apiSlice } from "./apiSlice";

export const netWorthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentNetWorth: builder.query({
      query: () => "/net-worth/current",
      providesTags: ["NetWorth"],
    }),
    getNetWorthHistory: builder.query({
      query: (params) => ({
        url: "/net-worth/history",
        params,
      }),
      providesTags: ["NetWorth"],
    }),
  }),
});

export const {
  useGetCurrentNetWorthQuery,
  useGetNetWorthHistoryQuery,
} = netWorthApi;
