import { apiSlice } from "./apiSlice";

export const recurringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecurring: builder.query({
      query: () => "/recurring",
      providesTags: ["Recurring"],
    }),
    createRecurring: builder.mutation({
      query: (data) => ({
        url: "/recurring",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Recurring"],
    }),
    updateRecurring: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/recurring/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Recurring"],
    }),
    toggleRecurringStatus: builder.mutation({
      query: (id) => ({
        url: `/recurring/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Recurring"],
    }),
    deleteRecurring: builder.mutation({
      query: (id) => ({
        url: `/recurring/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Recurring"],
    }),
  }),
});

export const {
  useGetRecurringQuery,
  useCreateRecurringMutation,
  useUpdateRecurringMutation,
  useToggleRecurringStatusMutation,
  useDeleteRecurringMutation,
} = recurringApi;
