import { apiSlice } from "./api-slice";

export const dpsFdrApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDpsFdr: builder.query({ query: () => "/dps-fdr", providesTags: ["DpsFdr"] }),
    createDpsFdr: builder.mutation({
      query: (body) => ({ url: "/dps-fdr", method: "POST", body }),
      invalidatesTags: ["DpsFdr", "Accounts", "Transactions"],
    }),
    updateDpsFdr: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/dps-fdr/${id}`, method: "PATCH", body }),
      invalidatesTags: ["DpsFdr"],
    }),
    payDps: builder.mutation({
      query: (id) => ({ url: `/dps-fdr/${id}/pay`, method: "POST" }),
      invalidatesTags: ["DpsFdr", "Accounts", "Transactions"],
    }),
    closeDpsFdr: builder.mutation({
      query: (id) => ({ url: `/dps-fdr/${id}/close`, method: "POST" }),
      invalidatesTags: ["DpsFdr"],
    }),
  }),
});

export const {
  useGetDpsFdrQuery,
  useCreateDpsFdrMutation,
  usePayDpsMutation,
  useCloseDpsFdrMutation,
} = dpsFdrApi;
