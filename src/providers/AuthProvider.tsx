"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { setCredentials, logout, setAuthLoading } from "../redux/slices/authSlice";
import { useLazyGetMeQuery, useLazyGetAdminMeQuery } from "../services/authApi";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [triggerGetAdminMe] = useLazyGetAdminMeQuery();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/admin-login");
        
        let response;
        if (isAdminRoute) {
          response = await triggerGetAdminMe(undefined, false).unwrap();
        } else {
          response = await triggerGetMe(undefined, false).unwrap();
        }

        if (response?.success) {
          const userObj = isAdminRoute ? response?.data?.admin : response?.data?.user;
          if (userObj) {
            // Normalize admin object to match user structure in redux
            let normalizedUser = { ...userObj };
            
            if (isAdminRoute) {
               normalizedUser.user_name = userObj.admin_name;
               normalizedUser.user_email = userObj.admin_email;
               normalizedUser.user_role = userObj.admin_role;
               normalizedUser.isAdmin = true;
            }
            dispatch(
              setCredentials({
                user: normalizedUser as any,
              })
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
