import { apiSlice } from "./api-slice";

export const loanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLoans: builder.query({
      query: (params) => ({
        url: "/loans",
        params,
      }),
      providesTags: ["Loans"],
    }),
    getLoanSummary: builder.query({
      query: () => "/loans/summary",
      providesTags: ["Loans"],
    }),
    getLoanById: builder.query({
      query: (id) => `/loans/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Loans", id }],
    }),
    createLoan: builder.mutation({
      query: (data) => ({
        url: "/loans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "Loans",
        "Accounts",
        "Transactions",
        "NetWorth",
        "Analytics",
        "Borrowers",
      ],
    }),
    updateLoan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/loans/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Loans", "Borrowers"],
    }),
    cancelLoan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/loans/${id}/cancel`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "Loans",
        "Accounts",
        "Transactions",
        "NetWorth",
        "Analytics",
        "Borrowers",
      ],
    }),
    writeOffLoan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/loans/${id}/write-off`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Loans", "NetWorth", "Analytics", "Borrowers"],
    }),
    deleteLoan: builder.mutation({
      query: (id) => ({
        url: `/loans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Loans", "Borrowers"],
    }),
    addRepayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/loans/${id}/repayments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "Loans",
        "Accounts",
        "Transactions",
        "NetWorth",
        "Analytics",
        "Borrowers",
      ],
    }),
    reverseRepayment: builder.mutation({
      query: ({ loanId, repaymentId }) => ({
        url: `/loans/${loanId}/repayments/${repaymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Loans",
        "Accounts",
        "Transactions",
        "NetWorth",
        "Analytics",
        "Borrowers",
      ],
    }),
    getBorrowers: builder.query({
      query: () => "/loans/borrowers",
      providesTags: ["Borrowers"],
    }),
    createBorrower: builder.mutation({
      query: (data) => ({
        url: "/loans/borrowers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Borrowers"],
    }),
    getBorrowerById: builder.query({
      query: (id) => `/loans/borrowers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Borrowers", id }],
    }),
    updateBorrower: builder.mutation({
      query: ({ id, data }) => ({
        url: `/loans/borrowers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Borrowers", "Loans"],
    }),
  }),
});

export const {
  useGetLoansQuery,
  useGetLoanSummaryQuery,
  useGetLoanByIdQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useCancelLoanMutation,
  useWriteOffLoanMutation,
  useDeleteLoanMutation,
  useAddRepaymentMutation,
  useReverseRepaymentMutation,
  useGetBorrowersQuery,
  useCreateBorrowerMutation,
  useGetBorrowerByIdQuery,
  useUpdateBorrowerMutation,
} = loanApi;
