import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "@/services/api-slice";
import authReducer from "./slices/auth-slice";
import layoutReducer from "./slices/layout-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    layout: layoutReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
