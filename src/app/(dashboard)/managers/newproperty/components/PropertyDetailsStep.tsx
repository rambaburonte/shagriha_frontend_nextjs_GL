"use client";

import { CustomFormField } from "@/components/FormField";
import { PropertyTypeEnum } from "@/lib/constants";
import type { PropertyFormData } from "@/lib/schemas";
import { useFormContext } from "react-hook-form";

const PropertyDetailsStep = () => {
  const form = useFormContext<PropertyFormData>();
  const stayType = form.watch("stayType");

  return (
    <div className="space-y-7">
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">Fees</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomFormField
            name="pricePerMonth"
            label="Price per Month"
            type="number"
          />
          <CustomFormField
            name="securityDeposit"
            label="Security Deposit"
            type="number"
          />
        </div>
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Property Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CustomFormField
            name="beds"
            label="Number of Beds"
            type="number"
          />
          <CustomFormField
            name="baths"
            label="Number of Baths"
            type="number"
          />
          <CustomFormField
            name="squareFeet"
            label="Square Feet"
            type="number"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomFormField
            name="isPetsAllowed"
            label="Pets Allowed"
            type="radio"
            options={[
              { value: "true", label: "Include" },
              { value: "false", label: "Not Included" },
            ]}
          />
          <CustomFormField
            name="isParkingIncluded"
            label="Parking Included"
            type="radio"
            options={[
              { value: "true", label: "Include" },
              { value: "false", label: "Not Included" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomFormField
            name="propertyType"
            label="Property Type"
            type="select"
            options={[
              { value: PropertyTypeEnum.Apartment, label: "Apartment" },
              { value: PropertyTypeEnum.Townhouse, label: "Town House" },
              {
                value: PropertyTypeEnum.SingleFamilyHome,
                label: "Single Family Home",
              },
            ]}
          />
          {stayType === "PayingGuest" && (
            <CustomFormField
              name="bathType"
              label="Bath Type"
              type="select"
              options={[
                { value: "Private", label: "Private" },
                { value: "SharedBath", label: "Shared Bath" },
              ]}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default PropertyDetailsStep;
