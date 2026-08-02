import { logout, setCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // For HttpOnly refresh and access cookies
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh
    const refreshResult: any = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data && refreshResult.data.success) {
      const user =
        refreshResult.data.data.user || (api.getState() as RootState).auth.user;
      if (user) {
        api.dispatch(setCredentials({ user }));
      }
      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Accounts",
    "Categories",
    "Transactions",
    "Transfers",
    "Budgets",
    "Goals",
    "Bills",
    "Notifications",
    "Analytics",
  ],
  endpoints: () => ({}),
});
