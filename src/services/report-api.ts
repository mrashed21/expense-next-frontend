import { apiSlice } from "./api-slice";

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBalanceSheet: builder.query({
      query: () => "/reports/balance-sheet",
      providesTags: ["NetWorth", "Accounts", "Assets", "Debts"], // Dependent on many entities
    }),
    getCashFlowReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: "/reports/cash-flow",
        params: { startDate, endDate },
      }),
      providesTags: ["Transactions"],
    }),
    getTaxReport: builder.query({
      query: (year) => ({
        url: "/reports/tax",
        params: { year },
      }),
      providesTags: ["Transactions"],
    }),
  }),
});

export const {
  useGetBalanceSheetQuery,
  useGetCashFlowReportQuery,
  useGetTaxReportQuery,
} = reportApi;
