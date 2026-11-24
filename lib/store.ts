import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "@/lib/features/appSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      app: appReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];