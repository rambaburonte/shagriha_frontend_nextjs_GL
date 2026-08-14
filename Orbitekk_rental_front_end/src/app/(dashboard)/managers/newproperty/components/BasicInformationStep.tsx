"use client";

import { CustomFormField } from "@/components/FormField";

const BasicInformationStep = () => {
  return (
    <div className="space-y-7">
      <section className="space-y-5">
        <CustomFormField
          name="name"
          label="Property Name (Optional)"
          placeholder="Enter the property name"
        />
        <CustomFormField
          name="description"
          label="Description (Optional)"
          type="textarea"
          placeholder="Describe the property, neighborhood, and key features"
        />
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-5">
        <h3 className="text-base font-semibold text-gray-950">
          Property Information
        </h3>
        <CustomFormField
          name="stayType"
          label="Stay Type"
          type="select"
          placeholder="Select a stay type"
          options={[
            { value: "PayingGuest", label: "Paying Guest" },
            { value: "WholeUnit", label: "Whole Unit" },
          ]}
        />
        <CustomFormField
          name="address"
          label="Address"
          placeholder="Street address"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CustomFormField name="city" label="City" placeholder="City" />
          <CustomFormField name="state" label="State" placeholder="State" />
          <CustomFormField
            name="postalCode"
            label="Postal Code"
            placeholder="Postal code"
          />
        </div>
        <CustomFormField
          name="country"
          label="Country"
          placeholder="Country"
        />
      </section>
    </div>
  );
};

export default BasicInformationStep;
