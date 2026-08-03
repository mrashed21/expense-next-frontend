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

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (isRefreshing) {
      if (refreshPromise) {
        await refreshPromise;
        result = await baseQuery(args, api, extraOptions);
      }
      return result;
    }

    isRefreshing = true;
    const state = api.getState() as RootState;
    const isAdmin = state.auth.user?.isAdmin;
    const refreshUrl = isAdmin ? "/admin/auth/refresh-token" : "/auth/refresh-token";

    refreshPromise = baseQuery(
      {
        url: refreshUrl,
        method: "POST",
      },
      api,
      extraOptions,
    );

    const refreshResult: any = await refreshPromise;

    if (refreshResult.data && refreshResult.data.success) {
      const user =
        refreshResult.data.data.user || refreshResult.data.data.admin || state.auth.user;
      if (user) {
        api.dispatch(setCredentials({ user }));
      }
      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }

    isRefreshing = false;
    refreshPromise = null;
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
