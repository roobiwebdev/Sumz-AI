import { configureStore } from "@reduxjs/toolkit";
import { articleApi } from "./article";

export const store = configureStore({
  reducer: {
    [articleApi.reducerPath]: articleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(articleApi.middleware),
});

// Define a RootState type
export type RootState = ReturnType<typeof store.getState>;

// Define a AppDispatch type
export type AppDispatch = typeof store.dispatch;
