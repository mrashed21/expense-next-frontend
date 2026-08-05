import { apiSlice } from "./apiSlice";

export const investmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvestments: builder.query({
      query: (params) => ({
        url: "/investments",
        params,
      }),
      providesTags: ["Investments"],
    }),
    getInvestmentById: builder.query({
      query: (id) => `/investments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Investments", id }],
    }),
    createInvestment: builder.mutation({
      query: (data) => ({
        url: "/investments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Investments"],
    }),
    updateInvestment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/investments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Investments"],
    }),
    deleteInvestment: builder.mutation({
      query: (id) => ({
        url: `/investments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Investments"],
    }),
    restoreInvestment: builder.mutation({
      query: (id) => ({
        url: `/investments/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Investments"],
    }),
  }),
});

export const {
  useGetInvestmentsQuery,
  useGetInvestmentByIdQuery,
  useCreateInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
  useRestoreInvestmentMutation,
} = investmentApi;
