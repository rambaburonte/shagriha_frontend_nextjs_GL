"use client";

import { Button } from "@/components/ui/button";
import type { PropertyFormStep } from "@/lib/propertyDraftStorage";

interface PropertyFormActionsProps {
  activeStep: PropertyFormStep;
  mode: "create" | "resume" | "edit";
  isBusy: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const PropertyFormActions = ({
  activeStep,
  mode,
  isBusy,
  onPrevious,
  onNext,
}: PropertyFormActionsProps) => {
  const isFirstStep = activeStep === "basic";
  const isLastStep = activeStep === "amenities";

  return (
    <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
      {!isFirstStep && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isBusy}
          className="w-full sm:w-auto"
        >
          Previous
        </Button>
      )}

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isBusy}
          className="w-full bg-secondary-600 text-white hover:bg-secondary-700 sm:min-w-28 sm:w-auto"
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full bg-secondary-600 text-white hover:bg-secondary-700 sm:min-w-32 sm:w-auto"
        >
          {isBusy
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save Changes"
              : "Create"}
        </Button>
      )}
    </div>
  );
};

export default PropertyFormActions;
