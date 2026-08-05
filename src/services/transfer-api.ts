import { apiSlice } from "./api-slice";

export const transferApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransfers: builder.query({
      query: () => "/transfers",
      providesTags: ["Transfers"],
    }),
    createTransfer: builder.mutation({
      query: (data) => ({
        url: "/transfers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transfers", "Accounts"],
    }),
  }),
});

export const { useGetTransfersQuery, useCreateTransferMutation } = transferApi;
