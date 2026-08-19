"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/authProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthReady } = useAuth();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery(
    undefined,
    { skip: !isAuthReady || !user }
  );
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsRedirecting(false);
      return;
    }

    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (userRole === "manager" && pathname === "/") {
        setIsRedirecting(true);
        router.replace("/managers/properties", { scroll: false });
      } else {
        setIsRedirecting(false);
      }
    }
  }, [user, authUser, router, pathname]);

  if ((user && authLoading) || isRedirecting) return <>Loading...</>;

  return (
    <div className="h-full w-full">
      <Navbar />
      <main
        className={`h-full flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
