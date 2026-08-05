import { apiSlice } from "./api-slice";

export const accountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => "/accounts",
      providesTags: ["Accounts"],
    }),
    createAccount: builder.mutation({
      query: (data) => ({
        url: "/accounts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Accounts"],
    }),
    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/accounts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Accounts"],
    }),
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;
