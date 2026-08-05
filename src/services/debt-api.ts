import { apiSlice } from "./api-slice";

export const debtApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDebts: builder.query({
      query: (params) => ({
        url: "/debts",
        params,
      }),
      providesTags: ["Debts"],
    }),
    getDebtById: builder.query({
      query: (id) => `/debts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Debts", id }],
    }),
    createDebt: builder.mutation({
      query: (data) => ({
        url: "/debts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Debts"],
    }),
    updateDebt: builder.mutation({
      query: ({ id, data }) => ({
        url: `/debts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Debts"],
    }),
    deleteDebt: builder.mutation({
      query: (id) => ({
        url: `/debts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Debts"],
    }),
    addPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/debts/${id}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Debts"],
    }),
  }),
});

export const {
  useGetDebtsQuery,
  useGetDebtByIdQuery,
  useCreateDebtMutation,
  useUpdateDebtMutation,
  useDeleteDebtMutation,
  useAddPaymentMutation,
} = debtApi;
