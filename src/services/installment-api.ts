import { apiSlice } from "./api-slice";

export const installmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstallments: builder.query({
      query: (params) => ({
        url: "/installments",
        params,
      }),
      providesTags: ["Installments"],
    }),
    getInstallmentById: builder.query({
      query: (id) => `/installments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Installments", id }],
    }),
    createInstallment: builder.mutation({
      query: (data) => ({
        url: "/installments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Installments"],
    }),
    updateInstallment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/installments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Installments"],
    }),
    deleteInstallment: builder.mutation({
      query: (id) => ({
        url: `/installments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Installments"],
    }),
    addInstallmentPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/installments/${id}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Installments"],
    }),
  }),
});

export const {
  useGetInstallmentsQuery,
  useGetInstallmentByIdQuery,
  useCreateInstallmentMutation,
  useUpdateInstallmentMutation,
  useDeleteInstallmentMutation,
  useAddInstallmentPaymentMutation,
} = installmentApi;
