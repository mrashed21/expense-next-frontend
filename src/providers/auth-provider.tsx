"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  logout,
  setAuthLoading,
  setCredentials,
} from "../redux/slices/auth-slice";
import {
  useLazyGetAdminMeQuery,
  useLazyGetMeQuery,
} from "../services/auth-api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [triggerGetAdminMe] = useLazyGetAdminMeQuery();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const initializeAuth = async () => {
      hasInitialized.current = true;
      try {
        const isAdminRoute =
          pathname?.startsWith("/admin") ||
          pathname?.startsWith("/admin-login");

        let response;
        let isAdmin = false;

        try {
          if (isAdminRoute) {
            response = await triggerGetAdminMe(undefined, false).unwrap();
            isAdmin = true;
          } else {
            response = await triggerGetMe(undefined, false).unwrap();
          }
        } catch (err: any) {
          if (!isAdminRoute && (err.status === 401 || err.status === 403)) {
            response = await triggerGetAdminMe(undefined, false).unwrap();
            isAdmin = true;
          } else {
            throw err;
          }
        }

        if (response?.success) {
          const userObj = isAdmin
            ? response?.data?.admin
            : response?.data?.user;
          if (userObj) {
            let normalizedUser = { ...userObj };

            if (isAdmin) {
              normalizedUser.user_name = userObj.admin_name;
              normalizedUser.user_email = userObj.admin_email;
              normalizedUser.user_role = userObj.admin_role;
              normalizedUser.isAdmin = true;
            }
            dispatch(
              setCredentials({
                user: normalizedUser as any,
              }),
            );
          } else {
            dispatch(logout());
          }
        } else {
          dispatch(logout());
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch, triggerGetMe, triggerGetAdminMe, pathname]);

  return <>{children}</>;
}
