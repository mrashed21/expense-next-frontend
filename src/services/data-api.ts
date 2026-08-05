import { apiSlice } from "./apiSlice";

export const dataApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchData: builder.query({
      query: (q: string) => ({
        url: `/data/search?q=${encodeURIComponent(q)}`,
        method: "GET",
      }),
    }),
    exportBackup: builder.query({
      query: () => ({
        url: "/data/backup",
        method: "GET",
      }),
    }),
    restoreBackup: builder.mutation({
      query: (payload) => ({
        url: "/data/restore",
        method: "POST",
        body: payload,
      }),
      // Invalidate tags so everything refetches after restore
      invalidatesTags: [
        "Accounts",
        "Categories",
        "Transactions",
        "Budgets",
        "Goals",
        "Bills",
        "Transfers",
      ],
    }),
  }),
});

export const { useLazyExportBackupQuery, useRestoreBackupMutation, useLazySearchDataQuery } = dataApi;
