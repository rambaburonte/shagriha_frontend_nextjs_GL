"use client";

import StoreProvider from "@/state/redux";
import AuthProvider from "./(auth)/authProvider";
import LocationInitializer from "@/components/LocationInitializer";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <LocationInitializer />
      <AuthProvider>{children}</AuthProvider>
    </StoreProvider>
  );
};

export default Providers;
