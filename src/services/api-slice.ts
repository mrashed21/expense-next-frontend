import { logout, setCredentials } from "@/redux/slices/auth-slice";
import { RootState } from "@/redux/store";
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://expense-tracker-bb-backend.vercel.app/api/v1";

let csrfPromise: Promise<string | null> | null = null;

const getCsrfFromCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )csrfToken=([^;]+)"));
  return match?.[2] || null;
};

const ensureCsrfToken = async () => {
  const token = getCsrfFromCookie();
  if (token || typeof window === "undefined") return token;

  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE_URL}/auth/csrf-token`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => data?.data?.csrfToken || null)
      .catch((error) => {
        console.error("Failed to fetch CSRF token", error);
        return null;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getCsrfFromCookie();
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
  const runBaseQuery = async (request: string | FetchArgs) => {
    const method =
      typeof request === "string" ? "GET" : request.method || "GET";
    if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
      await ensureCsrfToken();
    }
    return baseQuery(request, api, extraOptions);
  };

  let result = await runBaseQuery(args);

  if (result.error && result.error.status === 401) {
    if (isRefreshing) {
      if (refreshPromise) {
        await refreshPromise;
        result = await runBaseQuery(args);
      }
      return result;
    }

    isRefreshing = true;
    const state = api.getState() as RootState;
    const isLocalAdmin =
      typeof window !== "undefined"
        ? localStorage.getItem("isAdmin") === "true"
        : false;
    const isAdmin = state.auth.user?.isAdmin || isLocalAdmin;
    const refreshUrl = isAdmin
      ? "/admin/auth/refresh-token"
      : "/auth/refresh-token";

    refreshPromise = Promise.resolve(
      runBaseQuery({
        url: refreshUrl,
        method: "POST",
      }),
    );

    const refreshResult: any = await refreshPromise;

    if (refreshResult.data && refreshResult.data.success) {
      let user =
        refreshResult.data.data.user ||
        refreshResult.data.data.admin ||
        state.auth.user;

      if (refreshResult.data.data.admin) {
        user = {
          ...user,
          user_name: user.admin_name || user.user_name,
          user_email: user.admin_email || user.user_email,
          user_role: user.admin_role || user.user_role,
          isAdmin: true,
        };
      }

      if (user) {
        api.dispatch(setCredentials({ user }));
      }
      result = await runBaseQuery(args);
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
    "Loans",
    "Borrowers",
    "Installments",
    "NetWorth",
    "Recurring",
    "AdminSystemHealth",
    "AdminUsers",
    "AdminDashboard",
    "AdminActivity",
    "Reviews",
  ],
  endpoints: () => ({}),
});
