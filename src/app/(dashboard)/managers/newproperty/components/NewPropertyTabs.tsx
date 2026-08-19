"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { PropertyFormStep } from "@/lib/propertyDraftStorage";

const STEPS: Array<{ value: PropertyFormStep; label: string }> = [
  { value: "basic", label: "Basic Information" },
  { value: "details", label: "Property Details" },
  { value: "amenities", label: "Amenities & Preference" },
];

interface NewPropertyTabsProps {
  value: PropertyFormStep;
  highestAccessibleStep: number;
  onValueChange: (step: PropertyFormStep) => void;
}

const NewPropertyTabs = ({
  value,
  highestAccessibleStep,
  onValueChange,
}: NewPropertyTabsProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) =>
        onValueChange(nextValue as PropertyFormStep)
      }
      className="w-full"
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-none border-b border-gray-200 bg-white p-0 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <TabsTrigger
            key={step.value}
            value={step.value}
            disabled={index > highestAccessibleStep}
            className="min-h-11 justify-start rounded-none border-b-[3px] border-transparent px-4 text-left text-sm font-medium text-gray-700 data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-950 data-[state=active]:shadow-none sm:justify-center"
          >
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default NewPropertyTabs;
