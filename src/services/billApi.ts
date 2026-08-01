import { apiSlice } from "./apiSlice";

export const billApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: () => "/bills",
      providesTags: ["Bills"],
    }),
    createBill: builder.mutation({
      query: (data) => ({
        url: "/bills",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    payBill: builder.mutation({
      query: ({ id, account_id }) => ({
        url: `/bills/${id}/pay`,
        method: "PATCH",
        body: { account_id },
      }),
      invalidatesTags: ["Bills", "Accounts", "Transactions"],
    }),
    deleteBill: builder.mutation({
      query: (id) => ({
        url: `/bills/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bills"],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useCreateBillMutation,
  usePayBillMutation,
  useDeleteBillMutation,
} = billApi;
