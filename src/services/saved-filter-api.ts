import { apiSlice } from "./api-slice";

export const savedFilterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSavedFilters: builder.query({
      query: (type?: string) => ({
        url: `/saved-filters${type ? `?type=${type}` : ""}`,
      }),
      providesTags: ["SavedFilters"],
    }),
    createSavedFilter: builder.mutation({
      query: (data) => ({
        url: "/saved-filters",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SavedFilters"],
    }),
    deleteSavedFilter: builder.mutation({
      query: (id) => ({
        url: `/saved-filters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SavedFilters"],
    }),
  }),
});

export const {
  useGetSavedFiltersQuery,
  useCreateSavedFilterMutation,
  useDeleteSavedFilterMutation,
} = savedFilterApi;
