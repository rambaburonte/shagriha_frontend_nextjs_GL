"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  DEFAULT_PROPERTY_FORM_VALUES,
} from "@/lib/propertyForm";
import {
  getPropertyDraft,
  type PropertyDraft,
} from "@/lib/propertyDraftStorage";
import type { PropertyFormData } from "@/lib/schemas";
import PropertyForm from "./components/PropertyForm";

const STEP_INDEX = {
  basic: 0,
  details: 1,
  amenities: 2,
} as const;

const NewPropertyContent = () => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(draftId));

  useEffect(() => {
    if (!draftId) {
      setIsLoadingDraft(false);
      return;
    }

    setDraft(getPropertyDraft(draftId) ?? null);
    setIsLoadingDraft(false);
  }, [draftId]);

  const initialValues = useMemo<PropertyFormData>(() => {
    if (!draft) return DEFAULT_PROPERTY_FORM_VALUES;

    return {
      ...DEFAULT_PROPERTY_FORM_VALUES,
      ...draft.values,
      photoUrls: [],
      existingPhotoUrls: draft.values.existingPhotoUrls ?? [],
    };
  }, [draft]);

  if (isLoadingDraft) return <Loading />;

  return (
    <div className="dashboard-container min-w-0">
      <div className="mx-auto w-full max-w-6xl">
        <Header
          title={draft ? "Resume Property" : "Add New Property"}
          subtitle="Create a new property listing with detailed information"
        />

        {draftId && !draft ? (
          <div className="rounded-xl border bg-white p-6">
            This draft could not be found. Start a new property instead.
          </div>
        ) : (
          <PropertyForm
            key={draft?.id ?? "new-property"}
            mode={draft ? "resume" : "create"}
            draftId={draft?.id}
            initialValues={initialValues}
            initialHighestAccessibleStep={
              draft
                ? Math.min(STEP_INDEX[draft.lastCompletedStep] + 1, 2)
                : 0
            }
          />
        )}
      </div>
    </div>
  );
};

const NewPropertyPage = () => (
  <Suspense fallback={<Loading />}>
    <NewPropertyContent />
  </Suspense>
);

export default NewPropertyPage;
