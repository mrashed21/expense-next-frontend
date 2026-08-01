import { apiSlice } from "./apiSlice";

export const goalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGoals: builder.query({
      query: () => "/goals",
      providesTags: ["Goals"],
    }),
    createGoal: builder.mutation({
      query: (data) => ({
        url: "/goals",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Goals"],
    }),
    depositToGoal: builder.mutation({
      query: ({ id, amount }) => ({
        url: `/goals/${id}/deposit`,
        method: "PATCH",
        body: { amount },
      }),
      invalidatesTags: ["Goals"],
    }),
    deleteGoal: builder.mutation({
      query: (id) => ({
        url: `/goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Goals"],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useDepositToGoalMutation,
  useDeleteGoalMutation,
} = goalApi;
