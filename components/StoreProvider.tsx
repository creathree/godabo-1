"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    setStore(makeStore());
  }, []);

  if (!store) {
    return <>{children}</>;
  }

  return <Provider store={store}>{children}</Provider>;
}