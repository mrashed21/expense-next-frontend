"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout, setAuthLoading } from "../redux/slices/authSlice";
import { useLazyGetMeQuery } from "../services/authApi";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  useEffect(() => {
    const initializeAuth = async () => {

      try {
        const response = await triggerGetMe(undefined, false).unwrap();
        if (response?.success && response?.data?.user) {
          dispatch(
            setCredentials({
              user: response.data.user,
            })
          );
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
  }, [dispatch, triggerGetMe]);

  return <>{children}</>;
}
