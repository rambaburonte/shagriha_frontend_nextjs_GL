"use client";

import { useAuth } from "@/app/(auth)/authProvider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setAccessToken } from "@/lib/authToken";
import { api, useEnableManagerMutation, useGetAuthUserQuery } from "@/state/api";
import { useAppDispatch } from "@/state/redux";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ManagerOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthReady } = useAuth();
  const { data: authUser, isLoading } = useGetAuthUserQuery(undefined, {
    skip: !isAuthReady || !user,
  });
  const [enableManager, { isLoading: isSubmitting }] = useEnableManagerMutation();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/signin?returnTo=%2Fmanager%2Fonboarding");
    } else if (authUser?.userRole === "manager") {
      router.replace("/managers/newproperty");
    }
  }, [authUser, isAuthReady, router, user]);

  const nameParts = authUser?.userInfo?.name?.trim().split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const handleContinue = async () => {
    if (!authorized) return;
    try {
      const response = await enableManager({ authorizedToList: true }).unwrap();
      setAccessToken(response.token.accessToken);
      dispatch(api.util.resetApiState());
      toast.success("Property management is enabled.");
      router.replace("/managers/newproperty");
    } catch {
      toast.error("We could not enable property management. Please try again.");
    }
  };

  if (!isAuthReady || !user || isLoading || !authUser || authUser.userRole === "manager") {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-primary-100 px-4 py-16 sm:py-24">
      <section className="mx-auto max-w-2xl rounded-2xl border border-primary-200 bg-white p-6 shadow-sm sm:p-10">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary-600">
            Enable property management
          </p>
          <h1 className="text-3xl font-bold text-primary-800">Start listing properties</h1>
          <p className="mt-3 text-primary-600">
            Set up your manager profile to create and manage listings on ShaGriha.
            Your tenant activity and account history will stay intact.
          </p>
        </header>

        <div className="space-y-8">
          <fieldset>
            <legend className="mb-4 text-lg font-semibold text-primary-800">Account information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input id="email" value={authUser.userInfo.email ?? ""} readOnly className="pr-10" />
                  <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                </div>
                <p className="text-xs text-primary-500">This email belongs to your existing account.</p>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-lg font-semibold text-primary-800">How will you use ShaGriha?</legend>
            <p className="mb-4 text-sm text-primary-500">Optional</p>
            <RadioGroup className="grid gap-3 sm:grid-cols-3">
              {["Property Owner", "Property Manager", "Real Estate Agent"].map((option) => (
                <Label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary-200 p-4">
                  <RadioGroupItem value={option} />
                  {option}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="flex items-start gap-3 rounded-lg bg-primary-50 p-4">
            <Checkbox
              id="authorized"
              checked={authorized}
              onCheckedChange={(checked) => setAuthorized(checked === true)}
            />
            <Label htmlFor="authorized" className="cursor-pointer leading-5">
              I confirm that I am authorized to list or manage properties I add to ShaGriha.
            </Label>
          </div>

          <Button className="w-full sm:w-auto" disabled={!authorized || isSubmitting} onClick={handleContinue}>
            {isSubmitting ? "Enabling..." : "Continue to Add Property"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </section>
    </main>
  );
}
