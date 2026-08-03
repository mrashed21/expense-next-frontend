import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "@/services/apiSlice";
import authReducer from "./slices/authSlice";
import layoutReducer from "./slices/layoutSlice";

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
