import { apiSlice } from "./api-slice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query({
      query: () => ({
        url: "/analytics/summary",
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetAnalyticsSummaryQuery } = analyticsApi;
