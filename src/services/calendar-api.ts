import { apiSlice } from "./api-slice";

export const calendarApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarEvents: builder.query({
      query: ({ startDate, endDate }) => ({
        url: "/calendar",
        params: { startDate, endDate },
      }),
      providesTags: ["Transactions", "Bills", "Installments"],
    }),
  }),
});

export const { useGetCalendarEventsQuery } = calendarApi;
