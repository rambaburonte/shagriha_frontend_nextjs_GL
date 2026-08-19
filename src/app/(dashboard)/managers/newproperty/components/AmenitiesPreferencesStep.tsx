"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { CustomFormField } from "@/components/FormField";
import { PROPERTY_AMENITY_OPTIONS } from "@/lib/propertyForm";
import type { PropertyFormData } from "@/lib/schemas";

const AmenitiesPreferencesStep = () => {
  const form = useFormContext<PropertyFormData>();
  const existingPhotoUrls = form.watch("existingPhotoUrls") ?? [];

  return (
    <div className="space-y-7">
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Amenities and Gender Preference
        </h3>
        <CustomFormField
          name="amenities"
          label="Amenities"
          type="checkbox-group"
          options={PROPERTY_AMENITY_OPTIONS}
        />
        <CustomFormField
          name="genderPreference"
          label="Gender Preference"
          type="checkbox-group"
          singleSelection
          options={[
            { value: "NoPreference", label: "No Preference" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Photos</h3>

        {existingPhotoUrls.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Saved property photos
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {existingPhotoUrls.map((photoUrl, index) => (
                <div
                  key={`${photoUrl}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                >
                  <Image
                    src={photoUrl}
                    alt={`Property photo ${index + 1}`}
                    fill
                    unoptimized={photoUrl.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <CustomFormField
          name="photoUrls"
          label="Property Photos"
          type="file"
          accept="image/*"
          multiple
          maxFiles={Math.max(0, 5 - existingPhotoUrls.length)}
        />
        <p className="text-sm text-gray-500">
          Upload up to 5 images. Each image must be smaller than 10 MB.
        </p>
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a publishing plan for this property.
          </p>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Property pricing plan"
        >
          <button
            type="button"
            role="radio"
            aria-checked="true"
            className="min-h-28 rounded-xl border border-secondary-500 bg-secondary-500 p-4 text-left text-white shadow-sm"
          >
            <span className="block font-semibold">Starter</span>
            <span className="mt-2 block text-sm">$0, free</span>
            <span className="mt-3 block text-xs font-medium uppercase tracking-wide">
              Selected
            </span>
          </button>

          {[
            { name: "Basic", price: "$X/month" },
            { name: "Premium", price: "$XX/month" },
          ].map((plan) => (
            <button
              key={plan.name}
              type="button"
              role="radio"
              aria-checked="false"
              disabled
              className="min-h-28 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-gray-400 opacity-75"
            >
              <span className="block font-semibold">{plan.name}</span>
              <span className="mt-2 block text-sm">{plan.price}</span>
              <span className="mt-3 block text-xs font-medium uppercase tracking-wide">
                Coming soon
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AmenitiesPreferencesStep;
