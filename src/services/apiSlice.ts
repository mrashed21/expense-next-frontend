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

let csrfPromise: Promise<string | null> | null = null;

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // For HttpOnly refresh and access cookies
  prepareHeaders: async (headers) => {
    const getCsrfFromCookie = () => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(^| )csrfToken=([^;]+)"));
      if (match) return match[2];
      return null;
    };

    let token = getCsrfFromCookie();
    
    // Fetch if missing
    if (!token && typeof window !== "undefined") {
      if (!csrfPromise) {
        csrfPromise = fetch(`${API_BASE_URL}/auth/csrf-token`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            csrfPromise = null;
            return data?.data?.csrfToken || null;
          })
          .catch((e) => {
            console.error("Failed to fetch CSRF token", e);
            csrfPromise = null;
            return null;
          });
      }
      token = await csrfPromise;
    }

    if (token) {
      headers.set("x-csrf-token", token);
    }
    return headers;
  },
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
    const refreshUrl = isAdmin
      ? "/admin/auth/refresh-token"
      : "/auth/refresh-token";

    refreshPromise = Promise.resolve(baseQuery(
      {
        url: refreshUrl,
        method: "POST",
      },
      api,
      extraOptions,
    ));

    const refreshResult: any = await refreshPromise;

    if (refreshResult.data && refreshResult.data.success) {
      const user =
        refreshResult.data.data.user ||
        refreshResult.data.data.admin ||
        state.auth.user;
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
    "SavedFilters",
    "Assets",
    "Investments",
    "Debts",
  ],
  endpoints: () => ({}),
});
