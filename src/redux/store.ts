import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import layoutReducer from "./slices/layoutSlice";
import filterReducer from "./slices/filterSlice";
import { apiSlice } from "../services/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    layout: layoutReducer,
    filter: filterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
