"use client";

import React, { useMemo, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PROPERTY_FORM_VALUES,
  buildDemoProperty,
  buildPropertyFormData,
  filesToDataUrls,
} from "@/lib/propertyForm";
import {
  deletePropertyDraft,
  savePropertyDraft,
  upsertDemoPublishedProperty,
  type PropertyFormStep,
  type StoredPropertyFormValues,
} from "@/lib/propertyDraftStorage";
import { FRONTEND_DEMO_MODE } from "@/lib/demoData";
import { getApiErrorMessage } from "@/lib/apiError";
import { propertySchema, type PropertyFormData } from "@/lib/schemas";
import {
  api,
  useCreatePropertyMutation,
  useGetAuthUserQuery,
  useUpdatePropertyMutation,
} from "@/state/api";
import { useAppDispatch } from "@/state/redux";
import type { Property } from "@/types/prismaTypes";
import NewPropertyTabs from "./NewPropertyTabs";
import BasicInformationStep from "./BasicInformationStep";
import PropertyDetailsStep from "./PropertyDetailsStep";
import AmenitiesPreferencesStep from "./AmenitiesPreferencesStep";
import PropertyFormActions from "./PropertyFormActions";

export type PropertyFormMode = "create" | "resume" | "edit";

const STEP_ORDER: PropertyFormStep[] = ["basic", "details", "amenities"];

const STEP_FIELDS: Record<PropertyFormStep, FieldPath<PropertyFormData>[]> = {
  basic: [
    "name",
    "description",
    "stayType",
    "addressLine1",
    "addressLine2",
    "city",
    "stateName",
    "postalCode",
    "countryName",
    "latitude",
    "longitude",
  ],
  details: [
    "pricePerMonth",
    "securityDeposit",
    "beds",
    "baths",
    "squareFeet",
    "isPetsAllowed",
    "isParkingIncluded",
    "propertyType",
  ],
  amenities: ["amenities", "genderPreference", "photoUrls"],
};

const STEP_COPY: Record<
  PropertyFormStep,
  { title: string; description: string }
> = {
  basic: {
    title: "Basic Information",
    description:
      "Add the core listing details used to create the property draft card.",
  },
  details: {
    title: "Property Details",
    description: "Add pricing, unit information, and property preferences.",
  },
  amenities: {
    title: "Amenities & Preference",
    description: "Select amenities, tenant preference, and property photos.",
  },
};

interface PropertyFormProps {
  mode: PropertyFormMode;
  initialValues?: PropertyFormData;
  draftId?: string | null;
  initialHighestAccessibleStep?: number;
  propertyId?: number;
  existingProperty?: Property;
}

const PropertyForm = ({
  mode,
  initialValues,
  draftId,
  initialHighestAccessibleStep = 0,
  propertyId,
  existingProperty,
}: PropertyFormProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: authUser } = useGetAuthUserQuery();
  const [createProperty, { isLoading: isCreating }] =
    useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] =
    useUpdatePropertyMutation();
  const [activeStep, setActiveStep] = useState<PropertyFormStep>("basic");
  const [highestAccessibleStep, setHighestAccessibleStep] = useState(
    mode === "edit" ? 2 : initialHighestAccessibleStep
  );
  const [isSavingLocally, setIsSavingLocally] = useState(false);

  const formDefaults = useMemo(
    () => initialValues ?? DEFAULT_PROPERTY_FORM_VALUES,
    [initialValues]
  );

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: formDefaults,
    mode: "onBlur",
    shouldUnregister: false,
  });

  const isBusy = isCreating || isUpdating || isSavingLocally;
  const currentStepIndex = STEP_ORDER.indexOf(activeStep);
  const currentCopy = STEP_COPY[activeStep];

  const validateCurrentStep = () =>
    form.trigger(STEP_FIELDS[activeStep], {
      shouldFocus: true,
    });

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const nextIndex = Math.min(currentStepIndex + 1, STEP_ORDER.length - 1);
    setHighestAccessibleStep((current) => Math.max(current, nextIndex));
    setActiveStep(STEP_ORDER[nextIndex]);
  };

  const handlePrevious = () => {
    const previousIndex = Math.max(currentStepIndex - 1, 0);
    setActiveStep(STEP_ORDER[previousIndex]);
  };

  const prepareValuesForPersistence = async (values: PropertyFormData) => {
    const uploadedPhotoUrls = await filesToDataUrls(values.photoUrls as File[]);
    const existingPhotoUrls = [
      ...(values.existingPhotoUrls ?? []),
      ...uploadedPhotoUrls,
    ];

    if (uploadedPhotoUrls.length > 0) {
      form.setValue("existingPhotoUrls", existingPhotoUrls, {
        shouldDirty: true,
      });
      form.setValue("photoUrls", [], { shouldDirty: true });
    }

    return {
      ...values,
      photoUrls: [],
      existingPhotoUrls,
    } satisfies PropertyFormData;
  };

  const saveDraftAndExit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setIsSavingLocally(true);
    try {
      const userId = authUser?.authInfo?.userId;
      if (!userId) throw new Error("Sign in before saving a draft");
      const values = await prepareValuesForPersistence(form.getValues());
      const { photoUrls: _photoUrls, ...storedValues } = values;

      savePropertyDraft({
        userId,
        id: draftId ?? undefined,
        values: storedValues as StoredPropertyFormValues,
        lastCompletedStep: activeStep,
      });

      toast.success("Property draft saved.");
      router.push("/managers/properties");
    } catch {
      toast.error("Unable to save this property draft.");
    } finally {
      setIsSavingLocally(false);
    }
  };

  const persistProperty = async (
    rawValues: PropertyFormData,
    exitAfterSave = false
  ) => {
    const managerUserId =
      authUser?.authInfo?.userId ?? existingProperty?.managerUserId;

    if (!managerUserId) {
      toast.error("No manager account was found for this property.");
      return;
    }

    setIsSavingLocally(true);
    try {
      if (FRONTEND_DEMO_MODE) {
        const values = await prepareValuesForPersistence(rawValues);
        const resolvedPropertyId =
          mode === "edit" && propertyId ? propertyId : Date.now();
        const property = buildDemoProperty(values, {
          id: resolvedPropertyId,
          managerUserId,
          photoUrls: values.existingPhotoUrls,
          existingProperty,
        });

        upsertDemoPublishedProperty(property);
        deletePropertyDraft(managerUserId, draftId);
        dispatch(
          api.util.invalidateTags([
            { type: "Properties", id: "LIST" },
            { type: "Properties", id: property.id },
            { type: "PropertyDetails", id: property.id },
          ])
        );

        toast.success(
          mode === "edit"
            ? "Property changes saved."
            : "Property created successfully."
        );

        router.push(
          exitAfterSave
            ? "/managers/properties"
            : `/managers/properties/${property.id}`
        );
        return;
      }

      const payload = buildPropertyFormData(rawValues);
      const savedProperty =
        mode === "edit" && propertyId
          ? await updateProperty({ id: propertyId, property: payload }).unwrap()
          : await createProperty(payload).unwrap();

      deletePropertyDraft(managerUserId, draftId);
      router.push(
        exitAfterSave
          ? "/managers/properties"
          : `/managers/properties/${savedProperty.id}`
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          mode === "edit"
            ? "Unable to save the property changes."
            : "Unable to create the property."
        )
      );
    } finally {
      setIsSavingLocally(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (mode === "edit") {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
      await persistProperty(form.getValues(), true);
      return;
    }

    await saveDraftAndExit();
  };

  const handleFinalSubmit = async (values: PropertyFormData) => {
    await persistProperty(values);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (activeStep !== "amenities") {
      event.preventDefault();
      void handleNext();
      return;
    }

    void form.handleSubmit(handleFinalSubmit)(event);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <NewPropertyTabs
          value={activeStep}
          highestAccessibleStep={highestAccessibleStep}
          onValueChange={setActiveStep}
        />

        <div className="min-h-[520px] rounded-xl bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                {currentCopy.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {currentCopy.description}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndExit}
              disabled={isBusy}
              className="w-full shrink-0 sm:w-auto"
            >
              {isBusy ? "Saving..." : "Save & Exit"}
            </Button>
          </div>

          {activeStep === "basic" && <BasicInformationStep />}
          {activeStep === "details" && <PropertyDetailsStep />}
          {activeStep === "amenities" && <AmenitiesPreferencesStep />}

          <PropertyFormActions
            activeStep={activeStep}
            mode={mode}
            isBusy={isBusy}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;
