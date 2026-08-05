import { apiSlice } from "./api-slice";

export const budgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBudgets: builder.query({
      query: (month_year) => ({
        url: "/budgets",
        params: { month_year },
      }),
      providesTags: ["Budgets"],
    }),
    createBudget: builder.mutation({
      query: (data) => ({
        url: "/budgets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Budgets"],
    }),
    deleteBudget: builder.mutation({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Budgets"],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
} = budgetApi;
