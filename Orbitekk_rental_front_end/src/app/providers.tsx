"use client";

import StoreProvider from "@/state/redux";
import AuthProvider from "./(auth)/authProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>{children}</AuthProvider>
    </StoreProvider>
  );
};

export default Providers;
