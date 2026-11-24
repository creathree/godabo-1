import { createSlice } from "@reduxjs/toolkit";

/** スライスを足すまでのプレースホルダー */
const appSlice = createSlice({
  name: "app",
  initialState: { ready: true as const },
  reducers: {},
});

export const appReducer = appSlice.reducer;