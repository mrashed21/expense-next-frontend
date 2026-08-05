import { apiSlice } from "./api-slice";

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: (params) => ({
        url: "/transactions",
        params,
      }),
      providesTags: ["Transactions"],
    }),
    createTransaction: builder.mutation({
      query: (data) => ({
        url: "/transactions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/transactions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
    bulkDeleteTransactions: builder.mutation({
      query: (ids) => ({
        url: "/transactions/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
    bulkEditTransactions: builder.mutation({
      query: (data) => ({
        url: "/transactions/bulk-edit",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Transactions", "Analytics"],
    }),
    restoreTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
    bulkRestoreTransactions: builder.mutation({
      query: (ids: string[]) => ({
        url: "/transactions/bulk-restore",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Transactions", "Accounts", "Analytics"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useBulkDeleteTransactionsMutation,
  useBulkEditTransactionsMutation,
  useRestoreTransactionMutation,
  useBulkRestoreTransactionsMutation,
} = transactionApi;
