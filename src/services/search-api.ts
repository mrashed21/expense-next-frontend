import { apiSlice } from "./api-slice";

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: (q) => ({
        url: "/search",
        params: { q },
      }),
    }),
  }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi;
