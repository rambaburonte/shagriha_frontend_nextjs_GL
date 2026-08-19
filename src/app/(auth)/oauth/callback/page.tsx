"use client";

import { useAuth } from "@/app/(auth)/authProvider";
import { setAccessToken } from "@/lib/authToken";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get("access_token");
    const userId = fragment.get("user_id");
    const username = fragment.get("username") ?? undefined;

    if (!accessToken || !userId) {
      toast.error("Google sign-in could not be completed.");
      router.replace("/signin");
      return;
    }

    setAccessToken(accessToken);
    setUser({ userId, username });
    window.history.replaceState(null, "", window.location.pathname);
    toast.success("Signed in with Google.");
    router.replace("/search");
  }, [router, setUser]);

  return <main className="flex min-h-screen items-center justify-center">Completing sign-in…</main>;
}
